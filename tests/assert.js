const log = require('./../service/logService')

module.exports = {
    notUndefined: function(value){ 
        if(value === undefined){
            log.testLog('value undefined | Assert failed');
            return false;
        }
        return true;
    },

    notNull: function(value){
        if(value === null){
            log.testLog('value null | Assert failed');
            return false;
        }
        return true;
    },

    equals: function(a,b){
        if(a != b){
            log.testLog('Both values are not equal | Assert failed');
            return false;
        }
        else if(a !== b){
            log.testLog('values and types are not equal | Assert warning','warn');
        }
        return true;
    },

    notNullandUndefined: function(value){
        if (value === null || value === undefined) {
            log.testLog('value = '+value+' | Assert failed');
            return false;
        }
        return true;
    }
}