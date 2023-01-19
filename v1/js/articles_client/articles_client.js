

function ArticlesClient() {
    ArticlesClient.prototype.initialize = function() {
        this.bucketList = [];
        this.articleList = [];
        this.currentArticle = "";
        this.backendToken = null;
    }

    ArticlesClient.prototype.listBuckets = function() {
        var self = this;
        console.log("[INFO] ArticlesClient.prototype.listBuckets");
        doPost('/v1/wiki/listbuckets', 
            { _bl: _bl }, 
            function(data) {
                if (typeof data == 'object' && "token" in data) {
                    console.log("[INFO] ArticlesClient.prototype.listBuckets got a login token");
                    self.backendToken = data["token"];
                }
                else {
                    console.log("[INFO] ArticlesClient.prototype.listBuckets no login token found");
                    if (self.callbackListBucketsFailCustom != null) {
                        self.callbackListBucketsFailCustom(null);
                    }
                }

                if (typeof data == 'object' && "buckets" in data) {
                    console.log("[INFO] ArticlesClient.prototype.listBuckets got buckets");
                    
                    self.bucketList = data["buckets"];
                    
                    if (self.callbackListBucketsCustom != null) {
                        self.callbackListBucketsCustom(self.backendToken);
                    }
                }
                else {
                    console.log("[INFO] ArticlesClient.prototype.listBuckets fail");
                    if (self.callbackListBucketsFailCustom != null) {
                        self.callbackListBucketsFailCustom(self.backendToken);
                    }
                }
            });
    }
    ArticlesClient.prototype.callbackListBucketsCustom = function(token) {
        console.log("[INFO] ArticlesClient callbackListBucketsCustom got "
                    + "- needs function overriding");
    }
    ArticlesClient.prototype.callbackListBucketsFailCustom = function() {
        console.log("[INFO] ArticlesClient callbackListBucketsFailCustom got "
                    + "- needs function overriding");
    }

    ArticlesClient.prototype.setArticle = function(bucketName, articleName, articleBody) {
        var self = this;
        console.log("[INFO] ArticlesClient.prototype.setArticle", bucketName, articleName, articleBody);
        doPost('/v1/wiki/set/' + bucketName + '/' + articleName, 
            { _bl: _bl, text: articleBody }, 
            function(data) {
                if (typeof data == 'object' && "token" in data) {
                    console.log("[INFO] ArticlesClient.prototype.setArticle got a login token");
                    self.backendToken = data["token"];
                }
                else {
                    console.log("[INFO] ArticlesClient.prototype.setArticle no login token found");
                    if (self.callbackSetArticleFailCustom != null) {
                        self.callbackSetArticleFailCustom(null);
                    }
                }

                if (typeof data == 'object' && "status" in data && data["status"] == "OK") {
                    console.log("[INFO] ArticlesClient.prototype.getArticle got status " + data["status"]);
                    
                    if (self.callbackSetArticleCustom != null) {
                        self.callbackSetArticleCustom(self.backendToken, data["status"]);
                    }
                }
                else {
                    console.log("[INFO] ArticlesClient.prototype.setArticle fail " + data["status"]);
                    if (self.callbackSetArticleFailCustom != null) {
                        self.callbackSetArticleFailCustom(self.backendToken);
                    }
                }
            });
    }
    ArticlesClient.prototype.callbackSetArticleCustom = function(token) {
        console.log("[INFO] ArticlesClient callbackSetArticleCustom got "
                    + "- needs function overriding");
    }
    ArticlesClient.prototype.callbackSetArticleFailCustom = function() {
        console.log("[INFO] ArticlesClient callbackSetArticleFailCustom got "
                    + "- needs function overriding");
    }

    ArticlesClient.prototype.deleteArticle = function(bucketName, articleName) {
        var self = this;
        console.log("[INFO] ArticlesClient.prototype.deleteArticle", bucketName, articleName);
        doPost('/v1/wiki/delete/' + bucketName + '/' + articleName, 
            { _bl: _bl }, 
            function(data) {
                if (typeof data == 'object' && "token" in data) {
                    console.log("[INFO] ArticlesClient.prototype.deleteArticle got a login token");
                    self.backendToken = data["token"];
                }
                else {
                    console.log("[INFO] ArticlesClient.prototype.deleteArticle no login token found");
                    if (self.callbackDeleteArticleFailCustom != null) {
                        self.callbackDeleteArticleFailCustom(null);
                    }
                }

                if (typeof data == 'object' && "status" in data && data["status"] == "OK") {
                    console.log("[INFO] ArticlesClient.prototype.deleteArticle got status " + data["status"]);
                    
                    if (self.callbackDeleteArticleCustom != null) {
                        self.callbackDeleteArticleCustom(self.backendToken, data["status"]);
                    }
                }
                else {
                    console.log("[INFO] ArticlesClient.prototype.deleteArticle fail " + data["status"]);
                    if (self.callbackDeleteArticleFailCustom != null) {
                        self.callbackDeleteArticleFailCustom(self.backendToken);
                    }
                }
            });
    }
    ArticlesClient.prototype.callbackDeleteArticleCustom = function(token) {
        console.log("[INFO] ArticlesClient callbackDeleteArticleCustom got "
                    + "- needs function overriding");
    }
    ArticlesClient.prototype.callbackDeleteArticleFailCustom = function() {
        console.log("[INFO] ArticlesClient callbackDeleteArticleFailCustom got "
                    + "- needs function overriding");
    }
    
    ArticlesClient.prototype.getArticle = function(bucketName, articleName) {
        var self = this;
        console.log("[INFO] ArticlesClient.prototype.getArticle", bucketName, articleName);
        doPost('/v1/wiki/get/' + bucketName + '/' + articleName, 
            { _bl: _bl }, 
            function(data) {
                if (typeof data == 'object' && "token" in data) {
                    console.log("[INFO] ArticlesClient.prototype.getArticle got a login token");
                    self.backendToken = data["token"];
                }
                else {
                    console.log("[INFO] ArticlesClient.prototype.getArticle no login token found");
                    if (self.callbackGetArticleFailCustom != null) {
                        self.callbackGetArticleFailCustom(null);
                    }
                }

                if (typeof data == 'object' && "text" in data) {
                    console.log("[INFO] ArticlesClient.prototype.getArticle got text");
                    
                    self.currentArticle = data["text"];
                    
                    if (self.callbackGetArticleCustom != null) {
                        self.callbackGetArticleCustom(self.backendToken, data["text"]);
                    }
                }
                else {
                    console.log("[INFO] ArticlesClient.prototype.getArticle fail");
                    if (self.callbackGetArticleFailCustom != null) {
                        self.callbackGetArticleFailCustom(self.backendToken);
                    }
                }
            });
    }
    ArticlesClient.prototype.callbackGetArticleCustom = function(token) {
        console.log("[INFO] ArticlesClient callbackGetArticleCustom got "
                    + "- needs function overriding");
    }
    ArticlesClient.prototype.callbackGetArticleFailCustom = function() {
        console.log("[INFO] ArticlesClient callbackGetArticleFailCustom got "
                    + "- needs function overriding");
    }
    
    ArticlesClient.prototype.listArticles = function(bucketName) {
        var self = this;
        console.log("[INFO] ArticlesClient.prototype.listArticles", bucketName);
        doPost('/v1/wiki/list/' + bucketName, 
            { _bl: _bl }, 
            function(data) {
                if (typeof data == 'object' && "token" in data) {
                    console.log("[INFO] ArticlesClient.prototype.listArticles got a login token");
                    self.backendToken = data["token"];
                }
                else {
                    console.log("[INFO] ArticlesClient.prototype.listArticles no login token found");
                    if (self.callbackListArticlesFailCustom != null) {
                        self.callbackListArticlesFailCustom(null);
                    }
                }

                if (typeof data == 'object' && "articles" in data) {
                    console.log("[INFO] ArticlesClient.prototype.listArticles got articles");
                    
                    self.articleList = data["articles"];
                    
                    if (self.callbackListArticlesCustom != null) {
                        self.callbackListArticlesCustom(self.backendToken, data["articles"]);
                    }
                }
                else {
                    console.log("[INFO] ArticlesClient.prototype.listArticles fail");
                    if (self.callbackListArticlesFailCustom != null) {
                        self.callbackListArticlesFailCustom(self.backendToken);
                    }
                }
            });
    }
    ArticlesClient.prototype.callbackListArticlesCustom = function(token, articles) {
        console.log("[INFO] ArticlesClient callbackListArticlesCustom got "
                    + "- needs function overriding");
    }
    ArticlesClient.prototype.callbackListArticlesFailCustom = function() {
        console.log("[INFO] ArticlesClient callbackListArticlesFailCustom got "
                    + "- needs function overriding");
    }
    
    ArticlesClient.prototype.queryArticles = function(bucketName, queryText) {
        var self = this;
        console.log("[INFO] ArticlesClient.prototype.queryArticles", bucketName, queryText);
        doPost('/v1/wiki/query/' + bucketName, 
            { _bl: _bl, q: queryText }, 
            function(data) {
                if (typeof data == 'object' && "token" in data) {
                    console.log("[INFO] ArticlesClient.prototype.queryArticles got a login token");
                    self.backendToken = data["token"];
                }
                else {
                    console.log("[INFO] ArticlesClient.prototype.queryArticles no login token found");
                    if (self.callbackQueryArticlesFailCustom != null) {
                        self.callbackQueryArticlesFailCustom(null);
                    }
                }

                if (typeof data == 'object' && "articles" in data) {
                    console.log("[INFO] ArticlesClient.prototype.queryArticles got articles");
                    
                    self.articleList = data["articles"];
                    
                    if (self.callbackQueryArticlesCustom != null) {
                        self.callbackQueryArticlesCustom(self.backendToken, data["articles"]);
                    }
                }
                else {
                    console.log("[INFO] ArticlesClient.prototype.queryArticles fail");
                    if (self.callbackQueryArticlesFailCustom != null) {
                        self.callbackQueryArticlesFailCustom(self.backendToken);
                    }
                }
            });
    }
    ArticlesClient.prototype.callbackQueryArticlesCustom = function(token, articles) {
        console.log("[INFO] ArticlesClient callbackQueryArticlesCustom got "
                    + "- needs function overriding");
    }
    ArticlesClient.prototype.callbackQueryArticlesFailCustom = function(token) {
        console.log("[INFO] ArticlesClient callbackQueryArticlesFailCustom got "
                    + "- needs function overriding");
    }
}

