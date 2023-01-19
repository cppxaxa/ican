

// Note:
// 
// Note, instead of this we are using self (to retain this pointer)
// Reference https://stackoverflow.com/a/4700899/6484802
//
// Note, the fastapi transacts with the JS with valid json as string
// so, we need to do JSON.parse() and JSON.stringify() to support
// 
// All sequences are here

function bl_default()
{
    // Initialize normal
    // Start the wake word listener
    // After detecting a wake word, start recording
    // Send the recording to the server
    bl_default.prototype.initializeNormal = function() {
        console.log("[INFO] BL initializeNormal");

        var self = this;

        this.controller = webClientController();
        this.backendToken = "";
        setAppIconRed();

        this.controller.initialize();

        // Strictly preparation/ override first, then initialization

        this.controller.callbackTranscriptionService = function(response) {
            console.log("[INFO] BL callbackTranscriptionService ", response);
            self.controller.status["transcriptionStartTime"] = null;
            var jsonResponse = JSON.parse(response);
            if (typeof jsonResponse == 'object' && "token" in jsonResponse) {
                self.backendToken = jsonResponse["token"];
                setAppIconWhite();
                setTranscriptionResultConfirmationWithTimeout(jsonResponse["transcription"][0]);
                console.log("[INFO] BL token found and updated");
                console.log("[INFO] transcription text updated in the UI");
            }
            else {
                console.log("[INFO] BL transcriptionService: token not found in response");
                self.backendToken = "";
                setAppIconPale();
            }
        }
        this.controller.onWavRecordingFinished = function(blob) {
            console.log("[INFO] BL onWavRecordingFinished " + blob);
            hideRecognitionStartedUI();
            setAppIconRed();
            self.controller.invokeTranscriptionService(self.backendToken, blob);
        }
        this.controller.onWakeWordDetected = function(word) {
            if (word != "up") {
                console.log("\t[INFO] BL onWakeWordDetected - Uninteresting wake word, ignoring", word);
                return;
            }
            else {
                console.log("[INFO] BL onWakeWordDetected", word, 
                            "\nconfigData", self.controller.getConfig(), 
                            "\nstatus", self.controller.getStatus());
            }

            if (transcriptionResultConfirmationWithTimeout == null) {
                console.log("\t[INFO] BL onWakeWordDetected - transcriptionResultConfirmationWithTimeout == null ", 
                            "transcriptionResultConfirmationWithTimeout = ",
                            transcriptionResultConfirmationWithTimeout);
                
                var success = self.blStartWavRecording();

                if (!success) {
                    console.log("[INFO] Ignoring interesting wake word because transcription in progress");
                }
            }
            else {
                console.log("\t[INFO] BL onWakeWordDetected - transcriptionResultConfirmationWithTimeout != null, "
                            + "So we will try to cancel the previous transcription result ", 
                            "transcriptionResultConfirmationWithTimeout = ",
                            transcriptionResultConfirmationWithTimeout);
                clearTranscriptionResultDialog();
            }
        }
        this.controller.initWakeWordDetection();
    }

    bl_default.prototype.blStartWavRecording = function() {
        console.log("[INFO] BL blStartWavRecording");
        if (this.controller.getStatus()["transcriptionStartTime"] == null ||
            Date.now() - this.controller.getStatus()["transcriptionStartTime"] > this.controller.getConfig()["recordingTimeLimitInSeconds"]
            ) {
            this.controller.updateStatus({"transcriptionStartTime": Date.now()});
            this.controller.startWavRecording(
                this.controller.getConfig()["recordingMinTimeInSeconds"], 
                this.controller.getConfig()["recordingTimeLimitInSeconds"]);
            showRecognitionStartedUI();
            return true;
        }
        else {
            return false;
        }
    }


    bl_default.prototype.sendUserInput = function(text) {
        console.log("[INFO] BL sendUserInput, set the user message", text);
        appendUserInputText(text);
        console.log("[INFO] BL sendUserInput, call server and query response for text", text);
        setAppIconRed();

        var self = this;
        this.controller.callbackSendMessageToServer = function(data) {
            console.log("[INFO] BL sendUserInput, response", data);

            if (typeof data == 'object' && "token" in data) {
                console.log("[INFO] BL sendUserInput got a new token");
                self.backendToken = data["token"];
                var responseText = data["response"];
                if (responseText.toString().trim() != "")
                    appendPrivateResponseText(responseText);
                setAppIconWhite();
            }
            else {
                console.error("[INFO] BL sendUserInput failed to get token");
                self.backendToken = "";
                setAppIconPale();
            }
        };

        serverResponse = this.controller.sendMessageToServer(this.backendToken, text);
    }
    

    bl_default.prototype.queryConfig = function() {
        console.log("[INFO] BL queryConfig - INCOMPLETE");
    }

    // bl_default.prototype.sampleCall = function() {
    //     bl_default.prototype.queryConfig();
    //     console.log("[INFO] BL sampleCall", this.backendToken);
    // }

    // bl_default.prototype.showLoginToken = function() {
    //     console.log("[INFO] BL showLoginToken", this.backendToken);
    // }

    bl_default.prototype.logIntoServer = function(loginId, password) {
        console.log("[INFO] BL logIntoServer");
        var self = this;
        showPleaseWaitDialog();
        dopostqueue = $({});
        doPost('/v1/login', { _bl: _bl, loginId: loginId, password: password },
            function(data) {
                hidePleaseWaitDialog();
                
                if (typeof data == 'object' && "token" in data) {
                    console.log("[INFO] BL got a login token");
                    self.backendToken = data["token"];
                    setAppIconWhite();
                    showLoginSuccessDialog();
                    
                    // We set total initialization to 3 as we can see we have 3 intializations
                    if (AppSetting_enableNotificationService)
                        setTotalAppInitialization(4);
                    else
                        setTotalAppInitialization(3);

                    self.queryDebugMode(); // Expected to contribute in intialization status
                    // Commented this to improve startup time.
                    // self.getDeviceList(); // Expected to contribute in intialization status
                    self.getListTask(); // Expected to contribute in intialization status
                    self.getBinariesList(); // Expected to contribute in intialization status

                    if (AppSetting_enableNotificationService)
                        self.subscribeForWebuiNotification(); // Expected to contribute in intialization status
                }
                else {
                    console.log("[INFO] BL no login token found");
                    showLoginErrorDialog(8);
                    setAppIconPale();
                }
            });
    }

    bl_default.prototype.subscribeForWebuiNotification = function() {
        console.log("[INFO] BL Subscribing to webui notification");
        var self = this;
        this.controller.subscribeNotification(this, "webui", function(response) {
            console.log("[INFO] BL webuiNotificationCallback, updating the token", response);
            self.backendToken = response["token"];
            for (var message of response["messagelist"]) {
                processNotificationText(JSON.stringify(message));
            }

            contributeToAppInitialization(); // Contribute to intialization
        }, function() {
            console.error("[INFO] BL failed getting notification, clearing token");
            self.backendToken = "";
            setAppIconPale();

            contributeToAppInitializationError(); // Contribute to initialization
        });
    }

    bl_default.prototype.flushTaskNotificationBatch = function(taskId, count) {
        console.log("[INFO] BL flushTaskNotificationBatch");
        var self = this;
        showPleaseWaitDialog();
        this.controller.flushTaskNotificationBatch(taskId, count, function(response) {
            console.log("[INFO] BL flushTaskNotificationBatch, updating the token", response);
            self.backendToken = response["token"];
            var blankList = [];
            setTaskNotificationData(blankList);
            setAppIconWhite();
            hidePleaseWaitDialog();
        }, function(response) {
            console.error("[INFO] BL failed flushTaskNotificationBatch, clearing token", response);
            self.backendToken = "";
            setAppIconPale();
            hidePleaseWaitDialog();
        });
    }

    bl_default.prototype.peekTaskNotificationBatch = function(taskId, startIndex, count) {
        console.log("[INFO] BL fetchTaskNotificationBatch");
        var self = this;
        showPleaseWaitDialog();
        this.controller.peekTaskNotificationBatch(taskId, startIndex, count, function(response) {
            console.log("[INFO] BL fetchTaskNotificationBatch, updating the token", response);
            self.backendToken = response["token"];
            var dataList = [];
            for (var message of response["messagelist"]) {
                dataList.push(JSON.stringify(message));
            }
            setTaskNotificationData(dataList);
            setAppIconWhite();
            hidePleaseWaitDialog();
        }, function(response) {
            console.error("[INFO] BL failed fetchTaskNotificationBatch, clearing token", response);
            self.backendToken = "";
            setAppIconPale();
            hidePleaseWaitDialog();
        });
    }

    bl_default.prototype.pushNotificationData = function(device, packet) {
        console.log("[INFO] BL pushNotificationData");
        var self = this;
        showPleaseWaitDialog();
        this.controller.pushNotificationData(device, packet);
        this.controller.pushNotificationDataSuccessCallback = function(token, response) {
            console.log("[INFO] BL pushNotificationData, updating the token", response);
            self.backendToken = token;
            setAppIconWhite();
            hidePleaseWaitDialog();
        }
        this.controller.pushNotificationDataFailureCallback = function(token, response) {
            console.error("[INFO] BL failed pushNotificationData, clearing token", response);
            self.backendToken = "";
            setAppIconPale();
            hidePleaseWaitDialog();
        };
    }

    bl_default.prototype.fetchDebugData = function() {
        console.log("[INFO] BL fetchDebugData");

        setAppIconRed();
        var self = this;
        this.controller.callbackDebugDataFailCustom = function() {
            setAppIconPale();
        }
        this.controller.callbackDebugDataCustom = function(token, startPos, endPos, totalCount) {
            console.log("[INFO] BL callbackDebugDataCustom "
                        + "token, startPos, endPos, totalCount = ", 
                        token, startPos, endPos, totalCount);

            self.backendToken = token;
            setAppIconWhite();

            if (totalCount > 0) {
                drawDebugRangeSliderWidget(startPos, endPos, totalCount, false);
            }
            else {
                drawDebugRangeSliderWidget(0, 1, 2, true);
            }

            self.queryDebugData(startPos, endPos, 3);
        }

        this.controller.fetchDebugData(this.backendToken);
    }

    bl_default.prototype.queryDebugData = function(startPos, endPos, maxRootNodeSupport) {
        console.log("[INFO] BL queryDebugData");
        var ret = this.controller.queryDebugData(startPos, endPos, maxRootNodeSupport);
        drawDebugCallstackWidget(ret.treantGraphData);
        showDebugLastError(ret.lastError);
    }

    bl_default.prototype.setDebugMode = function(enable) {
        console.log("[INFO] BL setDebugMode");

        setAppIconRed();
        var self = this;
        this.controller.callbackSetDebugModeCustom = function(jsonResponse) {
            console.log("[INFO] BL setDebugMode done");
         
            var isEnabled = false;
            if (typeof jsonResponse == 'object' && "token" in jsonResponse) {
                self.backendToken = jsonResponse["token"];
                setAppIconWhite();
                isEnabled = jsonResponse["debugEnabled"];
                self.fetchDebugData();
                console.log("[INFO] BL setDebugMode: token found and updated");
            }
            else {
                console.log("[INFO] BL setDebugMode: token not found in response");
                self.backendToken = "";
                setAppIconPale();
            }

            setDebugModeUI(isEnabled);
        }

        this.controller.setDebugMode(enable);
    }

    bl_default.prototype.queryDebugMode = function() {
        console.log("[INFO] BL queryDebugMode INCOMPLETE");

        setAppIconRed();
        var self = this;
        this.controller.callbackQueryDebugModeCustom = function(jsonResponse) {
            console.log("[INFO] BL queryDebugMode done");
            var isEnabled = false;

            if (typeof jsonResponse == 'object' && "token" in jsonResponse) {
                self.backendToken = jsonResponse["token"];
                setAppIconWhite();
                isEnabled = jsonResponse["debugEnabled"];
                console.log("[INFO] BL queryDebugMode: token found and updated");

                // Contribute to initialization
                contributeToAppInitialization();
            }
            else {
                console.log("[INFO] BL queryDebugMode: token not found in response");
                self.backendToken = "";
                setAppIconPale();

                // Contribute to initialization
                contributeToAppInitializationError();
            }

            setDebugModeUI(isEnabled);
            self.fetchDebugData();
        }

        this.controller.queryDebugMode();
    }

    bl_default.prototype.clearDebugLogs = function() {
        console.log("[INFO] BL clearDebugLogs");
        
        setAppIconRed();
        var self = this;
        this.controller.callbackClearDebugLogsCustom = function(jsonResponse) {
            console.log("[INFO] BL clearDebugLogs done");

            if (typeof jsonResponse == 'object' && "token" in jsonResponse) {
                self.backendToken = jsonResponse["token"];
                setAppIconWhite();
                console.log("[INFO] BL clearDebugLogs: token found and updated");
            }
            else {
                console.log("[INFO] BL clearDebugLogs: token not found in response");
                self.backendToken = "";
                setAppIconPale();
            }

            self.fetchDebugData();
        }
        
        this.controller.clearDebugLogs();
    }

    bl_default.prototype.getDeviceList = function() {
        console.log("[INFO] BL getDeviceList");
        setAppIconRed();
        var self = this;
        this.controller.getDeviceListCallback = function(jsonResponse) {
            console.log("[INFO] BL getDeviceList got response");

            if (typeof jsonResponse == 'object' && "token" in jsonResponse) {
                self.backendToken = jsonResponse["token"];
                setDeviceListContent(jsonResponse["devices"], jsonResponse["values"]);
                setAppIconWhite();
                console.log("\t[INFO] BL getDeviceList: token found and updated");

                // Contribute to initialization
                contributeToAppInitialization();
            }
            else {
                console.log("\t[INFO] BL getDeviceList: token not found in response");
                self.backendToken = "";
                setAppIconPale();

                // Contribute to initialization
                contributeToAppInitializationError();
            }
        }
        this.controller.getDeviceList();
    }



    bl_default.prototype.createTask = function(taskWithoutId) {
        console.log("[INFO] BL createTask, overriding needed", taskWithoutId);
        var self = this;
        this.controller.createTaskCallback = function(token, data) {
            if (token != null && token.trim() != "") {
                if (data["status"] == "FAIL")
                    console.error("\t[INFO] BL createTaskCallback FAIL", data);
                else
                    console.log("\t[INFO] BL createTaskCallback", data);
                self.backendToken = token;
                
                // Update list of tasks
                self.getListTask();
            }
            else {
                console.log("[INFO] BL createTaskCallback: token not found in response");
                self.backendToken = "";
                setAppIconPale();
            }
        };
        this.controller.createTask(taskWithoutId);
    }

    bl_default.prototype.updateTask = function(taskWithId) {
        console.log("[INFO] BL updateTask", taskWithId);
        var self = this;
        this.controller.updateTaskCallback = function(token, data) {
            if (token != null && token.trim() != "") {
                console.log("\t[INFO] BL updateTaskCallback", data);
                self.backendToken = token;
                
                // Update list of tasks
                self.getListTask();
            }
            else {
                console.log("[INFO] BL updateTaskCallback: token not found in response");
                self.backendToken = "";
                setAppIconPale();
            }
        };
        this.controller.updateTask(taskWithId);
    }

    bl_default.prototype.deleteTask = function(taskId) {
        console.log("[INFO] BL deleteTask", taskId);
        var self = this;
        this.controller.deleteTaskCallback = function(token, data) {
            if (token != null && token.trim() != "") {
                if (data["status"] == "FAIL")
                    console.error("\t[INFO] BL deleteTaskCallback FAIL", data);
                else
                    console.log("\t[INFO] BL deleteTaskCallback", data);
                self.backendToken = token;
                
                // Update list of tasks
                self.getListTask();
            }
            else {
                console.log("[INFO] BL deleteTaskCallback: token not found in response");
                self.backendToken = "";
                setAppIconPale();
            }
        };
        this.controller.deleteTask(taskId);
    }

    bl_default.prototype.getListTask = function(additionalCallbackOnSuccess = null) {
        console.log("[INFO] BL getListTask");
        var self = this;
        this.controller.getListTaskCallback = function(token, tasklist) {
            if (token != null && token.trim() != "") {
                console.log("\t[INFO] BL getListTaskCallback", tasklist);
                self.backendToken = token;
                showTaskListUI(tasklist);

                if (additionalCallbackOnSuccess != null)
                    additionalCallbackOnSuccess(tasklist);

                // Contribute to initialization
                contributeToAppInitialization();
            }
            else {
                console.log("[INFO] BL getListTaskCallback: token not found in response");
                self.backendToken = "";
                setAppIconPale();

                // Contribute to initialization
                contributeToAppInitializationError();
            }
        };
        this.controller.getListTask();
    }

    bl_default.prototype.getBinariesList = function() {
        console.log("[INFO] BL getBinariesList");
        var self = this;
        this.controller.getBinariesListCallback = function(token, links) {
            if (token != null && token.trim() != "") {
                console.log("\t[INFO] BL getBinariesListCallback", links);
                self.backendToken = token;
                listBinariesToDownload(links);

                // Contribute to initialization
                contributeToAppInitialization();
            }
            else {
                console.log("[INFO] BL getBinariesListCallback: token not found in response");
                self.backendToken = "";
                setAppIconPale();

                // Contribute to initialization
                contributeToAppInitializationError();
            }
        };
        this.controller.getBinariesList();
    }

    bl_default.prototype.getTaskSnippet = function(taskId) {
        console.log("[INFO] BL getTaskSnippet", taskId);
        var self = this;
        this.controller.getTaskSnippetCallback = function(token, tasklist) {
            if (token != null && token.trim() != "") {
                console.log("\t[INFO] BL getTaskSnippetCallback", tasklist);
                self.backendToken = token;
            }
            else {
                console.log("[INFO] BL getTaskSnippetCallback: token not found in response");
                self.backendToken = "";
                setAppIconPale();
            }
        };
        this.controller.getTaskSnippet(taskId);
    }

    bl_default.prototype.getTaskSnippet = function(taskId) {
        console.log("[INFO] BL getTaskSnippet", taskId);
        var self = this;
        this.controller.getTaskSnippetCallback = function(token, tasklist) {
            if (token != null && token.trim() != "") {
                console.log("\t[INFO] BL getTaskSnippetCallback", tasklist);
                self.backendToken = token;
            }
            else {
                console.log("[INFO] BL getTaskSnippetCallback: token not found in response");
                self.backendToken = "";
                setAppIconPale();
            }
        };
        this.controller.getTaskSnippet(taskId);
    }

    bl_default.prototype.setTaskSnippet = function(taskId, snippet) {
        console.log("[INFO] BL setTaskSnippet", taskId);
        var self = this;
        this.controller.setTaskSnippetCallback = function(token, data) {
            if (token != null && token.trim() != "") {
                console.log("\t[INFO] BL setTaskSnippetCallback");
                if (data["status"] == "FAIL")
                    console.error("\t[INFO] BL setTaskSnippetCallback FAIL", data);
                else
                    console.log("\t[INFO] BL setTaskSnippetCallback", data);
                self.backendToken = token;
                
                // Update list of tasks
                self.getListTask(function(tasklist) {
                    showTaskContentPreviewByTaskId(taskId);
                });
            }
            else {
                console.log("[INFO] BL setTaskSnippetCallback: token not found in response");
                self.backendToken = "";
                setAppIconPale();
            }
        };
        this.controller.setTaskSnippet(taskId, snippet);
    }

    bl_default.prototype.fetchSdkInfoContent = function(callback, failureCallback = null) {
        console.log("[INFO] BL setTaskSnippet");
        var self = this;
        this.controller.getTaskSdkInfoCallback = function(token, data) {
            if (token != null && token.trim() != "") {
                console.log("\t[INFO] BL fetchSdkInfoContent");
                if (data["status"] == "FAIL")
                    console.error("\t[INFO] BL fetchSdkInfoContent FAIL", data);
                else {
                    console.log("\t[INFO] BL fetchSdkInfoContent", data);
                    callback(data["response"]);
                }
                self.backendToken = token;
            }
            else {
                console.log("[INFO] BL fetchSdkInfoContent: token not found in response");
                self.backendToken = "";
                setAppIconPale();

                if (failureCallback != null) {
                    failureCallback(data);
                }
            }
        };
        this.controller.getTaskSdkInfo();
    }
    
    bl_default.prototype.blWikiListAll = function() {
        console.log("[INFO] BL blWikiListAll");
        var self = this;
        this.controller.wikiListAllSuccess = function(token, articles) {
            if (token != null && token.trim() != "") {
                console.log("\t[INFO] BL blWikiListAll success");
                self.backendToken = token;
                setAppIconWhite();
                
                clearWikiData();
                for (articleIndex in articles) {
                    var decoratorSuffix = " ...";
                    var textLimit = 50;
                    if (articles[articleIndex]["text"].length < textLimit) {
                        decoratorSuffix = "";
                    }
                    
                    appendWikiArticleText(
                        articleIndex,
                        articles[articleIndex]["name"],
                        articles[articleIndex]["text"]);
                }
            }
            else {
                self.backendToken = "";
                setAppIconPale();
            }
        }
        this.controller.wikiListAllFailure = function(token) {
            console.error("\t[INFO] BL blWikiListAll failed");
            if (token != null && token.trim() != "") {
                self.backendToken = token;
                setAppIconWhite();
            }
            else {
                self.backendToken = "";
                setAppIconPale();
            }
        }
        setAppIconRed();
        this.controller.wikiListAll();
    }
    
    bl_default.prototype.blShowArticle = function(index) {
        var article = this.controller.getArticleAtIndex(index);
        
        if (article == null) {
            console.log("[INFO] bl_default.prototype.blShowArticle can't find the article at index=", index);
            return;
        }
        
        var self = this;
        showMarkdownEditor({
                "title": article["name"],
                "content": article["text"]
            },
            function(markdownTitleContentPair) {
                self.blSaveArticle(
                    markdownTitleContentPair["title"],
                    markdownTitleContentPair["content"])
            },
            function(markdownTitleContentPair) {
                self.blDeleteArticle({
                    "name": markdownTitleContentPair["title"]
                }, function (titleContentPair) {
                    closeMarkdownEditor();
                    clearWikiData();
                }, function (titleContentPair) {
                    showCustomMessageSnackbar("Failed to delete article");
                });
            },
            function() {
                var article = self.controller.getArticleAtIndex(index - 1);

                if (article == null) {
                    console.log("[INFO] bl_default.prototype.blShowArticle prevCallback can't find the article at index=", index);
                    return;
                }
                else {
                    self.blShowArticle(index - 1);
                }
            },
            function() {
                var article = self.controller.getArticleAtIndex(index + 1);

                if (article == null) {
                    console.log("[INFO] bl_default.prototype.blShowArticle nextCallback can't find the article at index=", index);
                    return;
                }
                else {
                    self.blShowArticle(index + 1);
                }
            });
    }
    
    bl_default.prototype.blWikiSearch = function(queryText) {
        console.log("[INFO] BL blWikiSearch");
        var self = this;
        this.controller.wikiQueryArticleSuccess = function(token, articles) {
            if (token != null && token.trim() != "") {
                console.log("\t[INFO] BL blWikiSearch success");
                self.backendToken = token;
                setAppIconWhite();
                
                clearWikiData();
                for (articleIndex in articles) {
                    var decoratorSuffix = " ...";
                    var textLimit = 50;
                    if (articles[articleIndex]["text"].length < textLimit) {
                        decoratorSuffix = "";
                    }
                    
                    appendWikiArticleText(
                        articleIndex,
                        articles[articleIndex]["name"],
                        articles[articleIndex]["text"]);
                }
            }
            else {
                self.backendToken = "";
                setAppIconPale();
            }
        }
        this.controller.wikiQueryArticleFailure = function(token) {
            console.error("\t[INFO] BL blWikiSearch failed");
            if (token != null && token.trim() != "") {
                self.backendToken = token;
                setAppIconWhite();
            }
            else {
                self.backendToken = "";
                setAppIconPale();
            }
        }
        setAppIconRed();
        this.controller.wikiQueryArticle(queryText);
    }
    
    bl_default.prototype.blCreateWikiArticle = function(wikiArticle, successHandler, failureHandler) {
        console.log("[INFO] BL blCreateWikiArticle");
        var self = this;
        this.controller.wikiCreateNewArticleSuccess = function(token, status) {
            if (token != null && token.trim() != "") {
                console.log("\t[INFO] BL blCreateWikiArticle success");
                self.backendToken = token;
                setAppIconWhite();
                
                if (successHandler != null) {
                    successHandler(wikiArticle);
                }
            }
            else {
                self.backendToken = "";
                setAppIconPale();
            }
        }
        this.controller.wikiCreateNewArticleFailure = function(token) {
            console.error("\t[INFO] BL blCreateWikiArticle failed");
            if (token != null && token.trim() != "") {
                self.backendToken = token;
                setAppIconWhite();
            }
            else {
                self.backendToken = "";
                setAppIconPale();
            }
            
            if (failureHandler != null) {
                failureHandler(wikiArticle);
            }
        }
        setAppIconRed();
        this.controller.wikiCreateNewArticle(wikiArticle);
    }
    
    bl_default.prototype.blDeleteArticle = function(wikiArticle, successHandler, failureHandler) {
        console.log("[INFO] BL blDeleteArticle");
        var self = this;
        this.controller.wikiDeleteArticleSuccess = function(token, status) {
            if (token != null && token.trim() != "") {
                console.log("\t[INFO] BL blDeleteArticle success");
                self.backendToken = token;
                setAppIconWhite();
                
                if (successHandler != null) {
                    successHandler(wikiArticle);
                }
            }
            else {
                self.backendToken = "";
                setAppIconPale();
            }
        }
        this.controller.wikiDeleteArticleFailure = function(token) {
            console.error("\t[INFO] BL blDeleteArticle failed");
            if (token != null && token.trim() != "") {
                self.backendToken = token;
                setAppIconWhite();
            }
            else {
                self.backendToken = "";
                setAppIconPale();
            }
            
            if (failureHandler != null) {
                failureHandler(wikiArticle);
            }
        }
        setAppIconRed();
        this.controller.wikiDeleteArticle(wikiArticle);
    }
    
    bl_default.prototype.blSaveArticle = function(name, text) {
        console.log("[INFO] BL blSaveArticle");
        var self = this;
        this.controller.wikiSaveArticleSuccess = function(token, status) {
            if (token != null && token.trim() != "") {
                console.log("\t[INFO] BL blSaveArticle success");
                self.backendToken = token;
                setAppIconWhite();
            }
            else {
                self.backendToken = "";
                setAppIconPale();
            }
        }
        this.controller.wikiSaveArticleFailure = function(token) {
            console.error("\t[INFO] BL blSaveArticle failed");
            if (token != null && token.trim() != "") {
                self.backendToken = token;
                setAppIconWhite();
            }
            else {
                self.backendToken = "";
                setAppIconPale();
            }
        }
        setAppIconRed();
        this.controller.wikiSaveArticle({
            "name": name,
            "text": text
        });
    }
    
    bl_default.prototype.blOpenArticleByName = function(name, successHandler, failureHandler) {
        console.log("[INFO] BL blOpenArticleByName, name=", name);
        var self = this;
        this.controller.wikiOpenArticleByNameSuccess = function(token, articles, index) {
            if (token != null && token.trim() != "") {
                console.log("\t[INFO] BL blOpenArticleByName success");
                self.backendToken = token;
                setAppIconWhite();
                
                clearWikiData();
                for (articleIndex in articles) {
                    var decoratorSuffix = " ...";
                    var textLimit = 50;
                    if (articles[articleIndex]["text"].length < textLimit) {
                        decoratorSuffix = "";
                    }
                    
                    appendWikiArticleText(
                        articleIndex,
                        articles[articleIndex]["name"],
                        articles[articleIndex]["text"]);
                }
                
                self.blShowArticle(index);
            
                if (successHandler != null) {
                    successHandler();
                }
            }
            else {
                self.backendToken = "";
                setAppIconPale();
            }
        }
        this.controller.wikiOpenArticleByNameFailure = function(token) {
            console.error("\t[INFO] BL blOpenArticleByName failed");
            if (token != null && token.trim() != "") {
                self.backendToken = token;
                setAppIconWhite();
            }
            else {
                self.backendToken = "";
                setAppIconPale();
            }
            
            if (failureHandler != null) {
                failureHandler();
            }
        }
        setAppIconRed();
        this.controller.wikiOpenArticleByName(name);
    }
}


// Actual invocation

_bl = new bl_default();
_bl.initializeNormal();
_bl.queryConfig();
_bl.controller.setConfig({
    "recordingMinTimeInSeconds": 2,
    "recordingTimeLimitInSeconds": 7,
    "transcriptionServiceUrl": AppSetting_transcriptionServiceUri + "/v1/transcribe_file"
});
