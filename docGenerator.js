const acorn = require('acorn');
const walk = require('acorn-walk');
const fs = require('fs');
const path = require('path');

function isDir(path) {
    const stats = fs.statSync(path)
    return stats.isDirectory();
}

function getJsFiles(filePath, DefaultFileName = 'index.js') {
    if(isDir(filePath)){
        const filePath_ = path.join(filePath, DefaultFileName);
        if (fs.existsSync(filePath_)) {
            return filePath_;
        } 
        return undefined;
    } else {
        if (fs.existsSync(filePath)) {
            return filePath; 
        }
        return undefined;
    }
}

function getAPIInfo(path, name, method, description, input, output, handler, filePath) {
    if(path != null)
        return {
            path: path,
            methods:[
                {
                    method: method,
                    name: name,
                    description: description,
                    middlewares: handler,
                    input: input,
                    output: output,
                    filepath: filePath
                }
            ]
        }
    else return {
        method: method,
        name: name,
        description: description,
        middlewares: handler,
        input: input,
        output: output,
        filepath: filePath
    };
}

function parseFile(file, pathPrefix = '') {
    const code = fs.readFileSync(file, 'utf-8');
    const ast = acorn.parse(code, {
        sourceType: 'module',
        ecmaVersion: 2020
    });

    let apiRoutes = [];

    walk.simple(ast, {

        CallExpression(node) {
            if(node.callee.type == 'MemberExpression') {
                if(node.arguments[1] != undefined && node.arguments[1].callee != undefined && node.arguments[1].callee.name == 'require') {                    
                    let infos = parseFile(getJsFiles(path.dirname(file)+"/"+node.arguments[1].arguments[0].value), pathPrefix+node.arguments[0].value)
                    apiRoutes = apiRoutes.concat(infos);
                } else if(node.arguments[1] != undefined && node.arguments[1].callee != undefined && node.arguments[1].callee.property != undefined && node.arguments[1].callee.property.name == 'static') {
                    let info = getAPIInfo(((pathPrefix == '/') ? '':pathPrefix) + node.arguments[0].value, 'A static File Route', "GET", "Routes for Static Files", 'File name with relative path', 'File', 'express.static(\'__PATH__\')', file);
                    apiRoutes.push(info)
                } else {
                    //handle methods directly
                    const method = node.callee.property.name;
                    if (['get', 'post', 'put', 'delete', 'patch', 'update'].includes(method)) {
                        
                        const path = ((pathPrefix == '/') ? '':pathPrefix) + node.arguments[0].value; // Route path
                        const handler = node.arguments[1]?.name || `ArrowFunctionExpression (${node.arguments[1].params.map(a=> a.name).join(", ")})=>{...}`; // Handler function name
                        // console.log(handler,code.substr(node.arguments[1].start, node.arguments[1].end - node.arguments[1].start))

                        // Handle multiple methods for the same route
                        let route = apiRoutes.find(route => route.path === path);
                        if (!route) {
                            route = { path: path, methods: [] };
                            apiRoutes.push(route);
                        }

                        const methodDetails = {
                            method: method.toUpperCase(),
                            name: `${method.charAt(0).toUpperCase() + method.slice(1)} ${path.split('/').join(" ").replace('*', 'any')}`,
                            description: `${method.charAt(0).toUpperCase() + method.slice(1)} for the route ${path}`,
                            input: "getInputForMethod(method)",
                            output: "getOutputForMethod(method)",
                            middlewares: handler,
                            filepath: file
                        };

                        route.methods.push(methodDetails);  

                    } else if (['use'].includes(method)) {
                        if(node.arguments[0].value != undefined && node.arguments[0].value.split("/").pop() != '*') {
                            if(node.arguments[1].type == "ArrowFunctionExpression") {
                                let info = getAPIInfo(((pathPrefix == '/') ? '':pathPrefix) +node.arguments[0].value, '__FILL__', "ALL", "API can handle any type of HTTP method to handle "+node.arguments[0].value.split("/").pop(), '', '', 'ArrowFunctionExpression',file);
                                apiRoutes.push(info)
                            }
                            else if(node.arguments[1].name != undefined) {
                                let info = getAPIInfo(((pathPrefix == '/') ? '':pathPrefix) +node.arguments[0].value,'__FILL__', "ALL", "API can handle any type of HTTP method to handle "+node.arguments[0].value.split("/").pop(), '', '', node.arguments[1].name, file);
                                apiRoutes.push(info)
                            } else {
                                console.log(node)
                            }
                        }
                    } else {
                        // console.log("NOT HANDLED method : "+ method);
                    }
                }
            } else {
                // console.log("NOT HANDLED expression : "+ node.callee.type);
            }
        }

    });

    return apiRoutes;
}




const routes = JSON.stringify(parseFile(getJsFiles(path.resolve("controller/index.js")), ""), null, 2);
// Write the generated documentation to a file
fs.writeFileSync('api-docs.json', routes);
console.log("API documentation generated as 'api-docs.json'");