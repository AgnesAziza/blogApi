module.exports = () => {
    let authTool = {};

    const addUrl = (u, m, urls) => {
        if (m == "*") {
            urls.push({ url: u, method: "GET" });
            urls.push({ url: u, method: "POST" });
            urls.push({ url: u, method: "PUT" });
            urls.push({ url: u, method: "PATCH" });
            urls.push({ url: u, method: "DELETE" });
            urls.push({ url: u, method: "COPY" });
            urls.push({ url: u, method: "HEAD" });
            urls.push({ url: u, method: "OPTIONS" });
            urls.push({ url: u, method: "LINK" });
            urls.push({ url: u, method: "UNLINK" });
            urls.push({ url: u, method: "PURGE" });
        } else {
            urls.push({ url: u, method: m.toUpperCase() });
        }
        return urls;
    };

    authTool.checkURL = (url, method, config) => {
        let urlsConfig = [];
        let result = false;

        for (let i = 0, len = config.length; i < len; i++) {
            const val = config[i];
            urlsConfig = addUrl(val.url, val.method, urlsConfig);
        }

        let newUrl = url;

        //Remove last slash to be sure to have same url
        if (newUrl.slice(-1) == "/") {
            newUrl = newUrl.substr(0, newUrl.length - 1);
        }

        urlsConfig.some(urlConfig => {
            //Same Url without URL parameters and Same Methods
            if (newUrl == urlConfig.url && method == urlConfig.method) {
                result = true;
                return true;
            } else {
                //Check if parameters in configUrl
                if (urlConfig.url.indexOf("/:") !== -1) {
                    const splitUrl = newUrl.split("/");
                    const splitConfigUrl = urlConfig.url.split("/");

                    if (
                        splitUrl.length == splitConfigUrl.length &&
                        method == urlConfig.method
                    ) {
                        let similar = true;
                        for (let j = 0; j < splitUrl.length; j++) {
                            if (
                                splitConfigUrl[j].indexOf(":") === -1 &&
                                splitUrl[j] !== splitConfigUrl[j]
                            ) {
                                similar = false;
                            }
                        }

                        //If Everything is similar (with parameters and method)
                        if (similar) {
                            result = true;
                            return true;
                        }
                    }
                }
            }
        });

        return result;
    };

    return authTool;
};
