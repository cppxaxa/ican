
// Capabilities are here
// We offer stateful functions and callbacks

function webClientController()
{
    var controller = {};
    
    controller["initialize"] = function() {
        this.configData = {};
        this.status = {
            "transcriptionStartTime": null
        };
        this.debugUtilClient = new DebugUtilClient();   
        this.debugUtilClient.initialize();
        this.notificationService = new NotificationService();
        this.notificationService.initialize();
        this.articlesClient = new ArticlesClient();
        this.articlesClient.initialize();
    }

    controller["subscribeNotification"] = function(_bl, deviceId, callbackFn, failureCallbackFn) {
        console.log("[INFO] subscribeNotification", deviceId);
        this.notificationService.subscribe(_bl, deviceId, callbackFn, failureCallbackFn);
    }

    controller["fetchDebugData"] = function(backendToken) {
        console.log("[INFO] fetchDebugData", backendToken);

        var self = this;
        this.debugUtilClient.callbackDebugDataFailCustom = function() {
            console.log("[INFO] debugUtilClient.callbackDebugDataFailCustom FAIL");
            self.callbackDebugDataFailCustom();
        }
        this.debugUtilClient.callbackDataCustom = function(token) {
            console.log("[INFO] debugUtilClient.callbackDataCustom OK", token);

            var totalCount = self.debugUtilClient.getTotalCount();
            var startPos = self.debugUtilClient.getStartPosition();
            var endPos = self.debugUtilClient.getEndPosition();

            self.callbackDebugDataCustom(token, startPos, endPos, totalCount);
        }

        this.debugUtilClient.fetchData(backendToken);
    }

    controller["queryDebugData"] = function(startPos, endPos, maxRootNodeSupport) {
        console.log("[INFO] queryDebugData, startPos endPos = ", startPos, " ", endPos);
        this.debugUtilClient.setStartPosition(startPos);
        this.debugUtilClient.setEndPosition(endPos);
        
        var ret = this.debugUtilClient.generateTreantGraphData(maxRootNodeSupport, 5);
        return ret;
    }

    controller["callbackDebugDataFailCustom"] = function() {
        console.log("[INFO] callbackDebugDataFailCustom, needs overridden");
    }

    controller["callbackDebugDataCustom"] = function(token, startPos, endPos, 
                                                        totalCount) {
        console.log("[INFO] callbackDebugDataCustom, needs overridden", token);
    }

    controller["setDebugMode"] = function(enableDebugMode) {
        console.log("[INFO] setDebugMode");
        var self = this;
        doPost('/v1/debug/enable', { _bl: _bl, enableDebug: enableDebugMode },
            function(data) {
                console.log("[INFO] setDebugMode, response data: ", data);
                self.callbackSetDebugModeCustom(data);
            });
    }

    controller["callbackSetDebugModeCustom"] = function(data) {
        console.log("[INFO] callbackDebugDataCustom, needs overridden", data);
    }

    controller["queryDebugMode"] = function() {
        console.log("[INFO] queryDebugMode");
        var self = this;
        doPost('/v1/debug/get', { _bl: _bl },
            function(data) {
                console.log("[INFO] queryDebugMode, response data: ", data);
                self.callbackQueryDebugModeCustom(data);
            });
    }

    controller["callbackQueryDebugModeCustom"] = function(data) {
        console.log("[INFO] callbackQueryDebugModeCustom, needs overridden", data);
    }

    controller["clearDebugLogs"] = function() {
        console.log("[INFO] clearDebugLogs");
        var self = this;
        doPost('/v1/debug/clear', { _bl: _bl }, 
            function(data) {
                console.log("[INFO] clearDebugLogs, response data: ", data);
                self.callbackClearDebugLogsCustom(data);
            });
    }

    controller["callbackClearDebugLogsCustom"] = function(data) {
        console.log("[INFO] callbackClearDebugLogsCustom, needs overridden", data);
    }

    

    controller["sayHello"] = function() {
        alert("Hello");
    }

    controller["setConfig"] = function(configData) {
        this.configData = configData;
        // console.log("[INFO] setConfig ", this.configData);
    }

    controller["getConfig"] = function() {
        // console.log("[INFO] getConfig ", this.configData);
        return this.configData;
    }

    controller["updateStatus"] = function(unit) {
        Object.assign(this.status, unit);
    }

    controller["getStatus"] = function() {
        return this.status;
    }

    controller["initWakeWordDetection"] = function() {
        console.log("[INFO] initWakeWordDetection");
        wakeWordApp(self.onWakeWordDetected);
    }

    controller["onWakeWordDetected"] = function(word) {
        console.log("[INFO] onWakeWordDetected " + word);
    }

    controller["log"] = function (msg) {
        console.log("[INFO] Controller log: " + msg);
    }

    controller["startWavRecording"] = function(minSeconds = 2, limSeconds = 7, consecutiveSilenceSeconds = 1.5) {
        console.log("[INFO] startWavRecording for minSeconds", minSeconds, "consecutiveSilenceSeconds", consecutiveSilenceSeconds, "time limit", limSeconds);
        onWavRecordingFinishedCustomCallback = controller["onWavRecordingFinished"];
        
        this.status["transcriptionStartTime"] = Date.now();

        startWavRecording(minSeconds, limSeconds, consecutiveSilenceSeconds);
    }

    controller["stopWavRecording"] = function() {
        console.log("[INFO] stopWavRecording");
        stopWavRecording();
    }

    controller["onWavRecordingFinished"] = function(blob) {
        console.log("[INFO] onWavRecordingFinished " + blob);
    }

    controller["invokeTranscriptionService"] = function(backendToken, blob) {
        console.log("[INFO] invokeTranscriptionService", this.configData["transcriptionServiceUrl"], blob);
        // CPPXAXA
        // transcribeWavBlob(backendToken, this.configData["transcriptionServiceUrl"], blob, controller["callbackTranscriptionService"]);
        doTranscribeWavBlob(backendToken, this.configData["transcriptionServiceUrl"], blob, controller["callbackTranscriptionService"]);
    }

    controller["callbackTranscriptionService"] = function(response) {
        console.log("[INFO] callbackTranscriptionService", response);
    }

    controller["sendMessageToServer"] = function(token, message) {
        console.log("[INFO] sendMessageToServer, token, message = ", token, message);
        var self = this;
        doPost('/v1/sendmessage', 
            { _bl: _bl, message: message },
            function(data) {
                console.log("[INFO] sendMessageToServer, response data: ", data);
                self.callbackSendMessageToServer(data);
            });
    }
    controller["callbackSendMessageToServer"] = function(response) {
        console.log("[INFO] callbackSendMessageToServer", response);
    }

    controller["getDeviceList"] = function() {
        console.log("[INFO] getDeviceList");
        var self = this;
        doPost('/v1/devices', 
            { _bl: _bl },
            function(data) {
                console.log("[INFO] getDeviceList, response data: ", data);
                self.getDeviceListCallback(data);
            });
    }
    controller["getDeviceListCallback"] = function(response) {
        console.log("[INFO] getDeviceListCallback, overriding needed", response);
    }

    controller["peekTaskNotificationBatch"] = function(taskId, startIndex, count, 
                                                onCustomSuccessCallback, onCustomFailureCallback) {
        console.log("[INFO] peekTaskNotificationBatch");
        var self = this;
        doPost('/v1/notification/peek/{device}/limit/{limit}/offset/{offset}'
                    .replace('{device}', taskId)
                    .replace('{limit}', count)
                    .replace('{offset}', startIndex), 
            { _bl: _bl },
            function(jsonResponse) {
                console.log("[INFO] peekTaskNotificationBatch, response data: ", jsonResponse);

                if (typeof jsonResponse == 'object' && "token" in jsonResponse) {
                    if (onCustomSuccessCallback != null)
                        onCustomSuccessCallback(jsonResponse);
                }
                else {
                    if (onCustomFailureCallback != null)
                        onCustomFailureCallback(jsonResponse);
                }
            });
    }

    controller["flushTaskNotificationBatch"] = function(taskId, count, 
                                                onCustomSuccessCallback, onCustomFailureCallback) {
        console.log("[INFO] getTaskNotificationBatch");
        var self = this;
        doPost('/v1/notification/get/{device}/limit/{limit}'
            .replace('{device}', taskId)
            .replace('{limit}', count),
            { _bl: _bl },
            function(jsonResponse) {
                console.log("[INFO] peekTaskNotificationBatch, response data: ", jsonResponse);

                if (typeof jsonResponse == 'object' && "token" in jsonResponse) {
                    if (onCustomSuccessCallback != null)
                        onCustomSuccessCallback(jsonResponse);
                }
                else {
                    if (onCustomFailureCallback != null)
                        onCustomFailuresCallback(jsonResponse)
                }
            });
    }

    /* Task client */

    controller["createTask"] = function(taskWithoutId) {
        console.log("[INFO] createTask", taskWithoutId);
        var self = this;
        taskWithoutId["_bl"] = _bl;
        doPost('/v1/task/create', taskWithoutId,
            function(jsonResponse) {
                console.log("\t[INFO] createTask, response data: ", jsonResponse);
                if (typeof jsonResponse == 'object' && "token" in jsonResponse) {
                    self.createTaskCallback(jsonResponse["token"], jsonResponse);
                }
                else {
                    self.createTaskCallback(null, jsonResponse);
                }
            });
    }
    controller["createTaskCallback"] = function(token, data) {
        console.log("[INFO] createTaskCallback, overriding needed", data);
    }

    controller["updateTask"] = function(taskWithId) {
        console.log("[INFO] updateTask, need implementation", taskWithId);
        var self = this;
        taskWithId["_bl"] = _bl;
        var taskId = taskWithId["id"];
        doPost('/v1/task/update/{taskid}'.replace('{taskid}', taskId), taskWithId,
            function(jsonResponse) {
                console.log("\t[INFO] updateTask, response data: ", jsonResponse);
                if (typeof jsonResponse == 'object' && "token" in jsonResponse) {
                    self.updateTaskCallback(jsonResponse["token"], jsonResponse);
                }
                else {
                    self.updateTaskCallback(null, jsonResponse);
                }
            });
    }
    controller["updateTaskCallback"] = function(token, data) {
        console.log("[INFO] updateTaskCallback, overriding needed", data);
    }

    controller["deleteTask"] = function(taskId) {
        console.log("[INFO] deleteTask", taskId);
        var self = this;
        doPost('/v1/task/delete/{taskid}'.replace('{taskid}', taskId),
            { _bl: _bl },
            function(jsonResponse) {
                console.log("\t[INFO] deleteTask, response data: ", jsonResponse);
                if (typeof jsonResponse == 'object' && "token" in jsonResponse) {
                    self.deleteTaskCallback(jsonResponse["token"], jsonResponse);
                }
                else {
                    self.deleteTaskCallback(null, jsonResponse);
                }
            });
    }
    controller["deleteTaskCallback"] = function(token, data) {
        console.log("[INFO] deleteTaskCallback, overriding needed", data);
    }

    controller["getListTask"] = function() {
        console.log("[INFO] getListTask");
        var self = this;
        doPost('/v1/task', { _bl: _bl },
            function(jsonResponse) {
                console.log("\t[INFO] getListTask, response data: ", jsonResponse);
                if (typeof jsonResponse == 'object' && "token" in jsonResponse) {
                    self.getListTaskCallback(jsonResponse["token"], jsonResponse["tasklist"]);
                }
                else {
                    self.getListTaskCallback(null, jsonResponse);
                }
            });
    }
    controller["getListTaskCallback"] = function(token, tasklist) {
        console.log("[INFO] getListTaskCallback, overriding needed", tasklist);
    }

    controller["getBinariesList"] = function() {
        console.log("[INFO] getBinariesList");
        var self = this;
        doPost('/v1/binaries', { _bl: _bl },
            function(jsonResponse) {
                console.log("\t[INFO] getBinariesList, response data: ", jsonResponse);
                if (typeof jsonResponse == 'object' && "token" in jsonResponse) {
                    self.getBinariesListCallback(jsonResponse["token"], jsonResponse["response"]);
                }
                else {
                    self.getBinariesListCallback(null, jsonResponse);
                }
            });
    }
    controller["getBinariesListCallback"] = function(token, links) {
        console.log("[INFO] getBinariesListCallback, overriding needed", links);
    }

    controller["getTaskSnippet"] = function(taskId) {
        console.error("[INFO] getTaskSnippet, need implementation", taskId);
    }
    controller["getTaskSnippetCallback"] = function(token, snippet) {
        console.log("[INFO] getTaskSnippetCallback, overriding needed", snippet);
    }

    controller["setTaskSnippet"] = function(taskId, snippet) {
        console.log("[INFO] setTaskSnippet", taskId, snippet);
        var self = this;
        doPost('/v1/task/snippet/set/{taskid}'.replace('{taskid}', taskId),
            { _bl: _bl, snippet: snippet },
            function(jsonResponse) {
                console.log("\t[INFO] setTaskSnippet, response data: ", jsonResponse);
                if (typeof jsonResponse == 'object' && "token" in jsonResponse) {
                    self.setTaskSnippetCallback(jsonResponse["token"], jsonResponse);
                }
                else {
                    self.setTaskSnippetCallback(null, jsonResponse);
                }
            });
    }
    controller["setTaskSnippetCallback"] = function(token) {
        console.log("[INFO] setTaskSnippetCallback, overriding needed");
    }

    controller["getTaskSdkInfo"] = function() {
        console.log("[INFO] getTaskSdkInfo");
        var self = this;
        doPost('/v1/task/sdkhint',
            { _bl: _bl },
            function(jsonResponse) {
                console.log("\t[INFO] getTaskSdkInfo, response data: ", jsonResponse);
                if (typeof jsonResponse == 'object' && "token" in jsonResponse) {
                    self.getTaskSdkInfoCallback(jsonResponse["token"], jsonResponse);
                }
                else {
                    self.getTaskSdkInfoCallback(null, jsonResponse);
                }
            });
    }
    controller["getTaskSdkInfoCallback"] = function(token) {
        console.log("[INFO] getTaskSdkInfoCallback, overriding needed");
    }

    controller["pushNotificationData"] = function(device, packet) {
        console.log("[INFO] pushNotificationData");
        var self = this;
        var payload = {
            _bl: _bl,
            name: "",
            content: "",
            type: "",
            metadata: {}
        };
        if ("name" in packet) payload["name"] = packet["name"];
        if ("content" in packet) payload["content"] = packet["content"];
        if ("type" in packet) payload["type"] = packet["type"];
        if ("metadata" in packet) payload["metadata"] = packet["metadata"];
        
        doPost('/v1/notification/push/{device}'.replace('{device}', device),
            payload,
            function(jsonResponse) {
                console.log("\t[INFO] pushNotificationData, response data: ", jsonResponse);
                if (typeof jsonResponse == 'object' && "token" in jsonResponse) {
                    self.pushNotificationDataSuccessCallback(jsonResponse["token"], jsonResponse);
                }
                else {
                    self.pushNotificationDataFailureCallback(null, jsonResponse);
                }
            });
    }
    controller["pushNotificationDataSuccessCallback"] = function(token, response) {
        console.log("[INFO] pushNotificationDataSuccessCallback, overriding needed");
    }
    controller["pushNotificationDataFailureCallback"] = function(token, response) {
        console.log("[INFO] pushNotificationDataFailureCallback, overriding needed");
    }
    
    controller["wikiListAll"] = function() {
        console.log("[INFO] wikiListAll");

        var self = this;
        this.articlesClient.callbackListArticlesFailCustom = function(token) {
            console.log("[INFO] wikiListAll FAIL");
            self.wikiListAllFailure(token);
        }
        this.articlesClient.callbackListArticlesCustom = function(token, articles) {
            console.log("[INFO] wikiListAll OK", token, articles);
            self.wikiListAllSuccess(token, articles);
        }

        this.articlesClient.listArticles("default");
    }
    controller["wikiListAllSuccess"] = function(token, articles) {
        console.log("[INFO] wikiListAllSuccess, overriding needed");
    }
    controller["wikiListAllFailure"] = function(token) {
        console.log("[INFO] wikiListAllFailure, overriding needed");
    }
    
    controller["getArticleAtIndex"] = function(index) {
        console.log("[INFO] getArticleAtIndex, overriding needed, index=", index);
        
        if (index in this.articlesClient.articleList) {
            return this.articlesClient.articleList[index];
        }
        
        return null;
    }
    
    controller["wikiCreateNewArticle"] = function(article) {
        console.log("[INFO] wikiCreateNewArticle");

        var self = this;
        this.articlesClient.callbackSetArticleFailCustom = function(token) {
            console.log("[INFO] wikiCreateNewArticle FAIL");
            self.wikiCreateNewArticleFailure(token);
        }
        this.articlesClient.callbackSetArticleCustom = function(token, status) {
            console.log("[INFO] wikiCreateNewArticle OK", token, status);
            self.wikiCreateNewArticleSuccess(token, status);
        }

        this.articlesClient.setArticle("default", article["name"], "");
    }
    controller["wikiCreateNewArticleSuccess"] = function(token, status) {
        console.log("[INFO] wikiCreateNewArticleSuccess, overriding needed");
    }
    controller["wikiCreateNewArticleFailure"] = function(token) {
        console.log("[INFO] wikiCreateNewArticleFailure, overriding needed");
    }
    
    controller["wikiDeleteArticle"] = function(article) {
        console.log("[INFO] wikiDeleteArticle");

        var self = this;
        this.articlesClient.callbackDeleteArticleFailCustom = function(token) {
            console.log("[INFO] wikiDeleteArticle FAIL");
            self.wikiDeleteArticleFailure(token);
        }
        this.articlesClient.callbackDeleteArticleCustom = function(token, status) {
            console.log("[INFO] wikiDeleteArticle OK", token, status);
            self.wikiDeleteArticleSuccess(token, status);
        }

        this.articlesClient.deleteArticle("default", article["name"]);
    }
    controller["wikiDeleteArticleSuccess"] = function(token, status) {
        console.log("[INFO] wikiDeleteArticleSuccess, overriding needed");
    }
    controller["wikiDeleteArticleFailure"] = function(token) {
        console.log("[INFO] wikiDeleteArticleFailure, overriding needed");
    }
    
    controller["wikiSaveArticle"] = function(article) {
        console.log("[INFO] wikiSaveArticle");

        var self = this;
        this.articlesClient.callbackSetArticleFailCustom = function(token) {
            console.log("[INFO] wikiSaveArticle FAIL");
            self.wikiSaveArticleFailure(token);
        }
        this.articlesClient.callbackSetArticleCustom = function(token, status) {
            console.log("[INFO] wikiSaveArticle OK", token, status);
            self.wikiSaveArticleSuccess(token, status);
        }

        this.articlesClient.setArticle("default", article["name"], article["text"]);
    }
    controller["wikiSaveArticleSuccess"] = function(token, status) {
        console.log("[INFO] wikiSaveArticleSuccess, overriding needed");
    }
    controller["wikiSaveArticleFailure"] = function(token) {
        console.log("[INFO] wikiSaveArticleFailure, overriding needed");
    }
    
    controller["wikiQueryArticle"] = function(queryText) {
        console.log("[INFO] wikiQueryArticle");

        var self = this;
        this.articlesClient.callbackQueryArticlesFailCustom = function(token) {
            console.log("[INFO] wikiQueryArticle FAIL");
            self.wikiQueryArticleFailure(token);
        }
        this.articlesClient.callbackQueryArticlesCustom = function(token, articles) {
            console.log("[INFO] wikiQueryArticle OK", token, articles);
            self.wikiQueryArticleSuccess(token, articles);
        }

        this.articlesClient.queryArticles("default", queryText);
    }
    controller["wikiQueryArticleSuccess"] = function(token, articles) {
        console.log("[INFO] wikiQueryArticleSuccess, overriding needed");
    }
    controller["wikiQueryArticleFailure"] = function(token) {
        console.log("[INFO] wikiQueryArticleFailure, overriding needed");
    }
    
    controller["wikiOpenArticleByName"] = function(articleName) {
        console.log("[INFO] wikiOpenArticleByName, articleName=", articleName);

        var self = this;
        this.articlesClient.callbackListArticlesFailCustom = function(token) {
            console.log("[INFO] wikiOpenArticleByName FAIL");
            self.wikiOpenArticleByNameFailure(token);
        }
        this.articlesClient.callbackListArticlesCustom = function(token, articles) {
            console.log("[INFO] wikiOpenArticleByName OK", token, articles);
            
            var index = -1;
            for (var idx in articles) {
                if (articles[idx]["name"] == articleName) {
                    index = parseInt(idx);
                    break;
                }
            }
            
            if (index >= 0) {
                console.log("\t[INFO] wikiOpenArticleByName index found", token, articles);
                self.wikiOpenArticleByNameSuccess(token, articles, index);
            }
            else {
                console.log("\t[INFO] wikiOpenArticleByName index not found", token);
                self.wikiOpenArticleByNameFailure(token);
            }
        }

        this.articlesClient.listArticles("default");
    }
    controller["wikiOpenArticleByNameSuccess"] = function(token, articles, index) {
        console.log("[INFO] wikiOpenArticleByNameSuccess, overriding needed");
    }
    controller["wikiOpenArticleByNameFailure"] = function(token) {
        console.log("[INFO] wikiOpenArticleByNameFailure, overriding needed");
    }

    return controller;
}