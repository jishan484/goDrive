module.exports.keyValidator = {
    randomize(auth, key, len, i) {
        var auth_new = "";
        for (i = auth.length - 1; i >= 0; i--) {
            auth_new += ((auth.charCodeAt(i) + auth.charCodeAt(len - i - 1) | 0) ^ key.charCodeAt(i % key.length)).toString(16);
        }
        return auth_new;
    },
    getToken(seed, key) {
        // hash the seed with the key without using extra libraries
        var hash = 0, i, chr, len, key_char;
        var auth = "";
        if (seed.length == 0) return hash;
        for (i = 0, len = seed.length; i < len; i++) {
            chr = seed.charCodeAt(i);
            key_char = key.charCodeAt(i % key.length);
            hash = ((hash << 5) - hash) + chr ^ key_char;
            hash |= 0; // Convert to 32bit integer
            auth += hash.toString(16);
        }
        auth = this.randomize(auth, key);
        return auth;
    }
    ,
    validate(key, token) {
        let main_key = key.split(" ");
        if (main_key[1] == this.getToken(main_key[0], "DEMOKEY")) {  //token.modKey;
            return true;
        }
        return false;
    }
};