
function replaceAll(string, search, replace) {
    return string.split(search).join(replace);
}

var snackbarContainer = null;
var showRecognitionStartedUI = function() {
    console.log("[INFO] UI showRecognitionStartedUI");
    var data = {
        message: '',
        timeout: 4000
    };
    snackbarContainer.MaterialSnackbar.showSnackbar(data);
};
var hideRecognitionStartedUI = function() {
    console.log("[INFO] UI hideRecognitionStartedUI");
    if (snackbarContainer.MaterialSnackbar.cleanup_)
        snackbarContainer.MaterialSnackbar.cleanup_();
    else
        snackbarContainer.classList.remove("mdl-snackbar--active");
}

var snackbarCustomMessageContainer = null;
var showCustomMessageSnackbar = function(text) {
    console.log("[INFO] UI showCustomMessageSnackbar");
    var data = {
        message: text,
        timeout: 3000
    };
    snackbarCustomMessageContainer.MaterialSnackbar.showSnackbar(data);
};
var hideCustomMessageSnackbar = function() {
    console.log("[INFO] UI hideCustomMessageSnackbar");
    if (snackbarCustomMessageContainer.MaterialSnackbar.cleanup_)
        snackbarCustomMessageContainer.MaterialSnackbar.cleanup_();
    else
        snackbarCustomMessageContainer.classList.remove("mdl-snackbar--active");
}

var taskMetadataEditorDialog = null;
var showTaskMetadataEditorDialog = function(data) {
    console.log("\t[INFO] UI showTaskMetadataEditorDialog", data);
    if ("id" in data)
        $('#taskMetadataEditorDialog_hiddenId').val(data["id"]);
    if ("name" in data)
        $('#taskMetadataEditorDialog_txtTaskName')[0].parentElement.MaterialTextfield.change(data["name"]);
    if ("description" in data)
        $('#taskMetadataEditorDialog_txtTaskDescription')[0].parentElement.MaterialTextfield.change(data["description"]);
    if ("runtype" in data) {
        if (data["runtype"] == "ASYNC")
            document.getElementById("taskMetadataEditorDialog_switchRuntype").checked = true;
        else
            document.getElementById("taskMetadataEditorDialog_switchRuntype").checked = false;
        document.getElementById("taskMetadataEditorDialog_switchRuntype").parentElement.MaterialSwitch.checkToggleState();
    }
    if ("timeout" in data)
        $('#taskMetadataEditorDialog_txtTimeout')[0].parentElement.MaterialTextfield.change(data["timeout"]);
    taskMetadataEditorDialog.showModal();
}

var taskMetadataNewTaskDialog = null;
var showTaskMetadataNewTaskDialog = function() {
    console.log("[INFO] UI showTaskMetadataNewTaskDialog");
    $('#taskMetadataNewTaskDialog_txtTaskName')[0].parentElement.MaterialTextfield.change("");
    $('#taskMetadataNewTaskDialog_txtTaskDescription')[0].parentElement.MaterialTextfield.change("");
    taskMetadataNewTaskDialog.showModal();
}


var pleaseWaitDialog = null;
var showPleaseWaitDialog = function(timeoutSeconds = 0) {
    console.log("[INFO] UI showPleaseWaitDialog");
    pleaseWaitDialog.showModal();
    if (timeoutSeconds > 0)
        setTimeout(hidePleaseWaitDialog, timeoutSeconds * 1000);
}
var hidePleaseWaitDialog = function() {
    pleaseWaitDialog.close();
}

var taskSdkInfoDialog = null;
var showTaskSdkInfoDialog = function() {
    console.log("[INFO] UI showTaskSdkInfoDialog");
    taskSdkInfoDialog.showModal();
}

var taskNotificationDialog = null;
var lastDeviceIdInTaskNotificationDialog = null;
var showTaskNotificationDialog = function(taskId, taskName) {
    console.log("[INFO] UI showTaskNotificationDialog", taskId, taskName);
    showNotificationQueueDialog(taskId, taskName, "Notifications for task ");
}
var showTaskInputQueueDialog = function(taskId, taskName) {
    console.log("[INFO] UI showTaskInputQueueDialog", taskId, taskName);
    var inputQueueForTask = taskId + "_input";
    showNotificationQueueDialog(inputQueueForTask, taskName, "Input queue for task ");
}
var showNotificationQueueDialog = function(taskId, taskName, titlePrefix) {
    console.log("[INFO] UI showNotificationQueueDialog", taskId, taskName);
    lastDeviceIdInTaskNotificationDialog = taskId;
    taskNotificationDialog.showModal();
    $("#taskNotificationDialog_taskName").html(titlePrefix + "\"" + taskName + "\"");
    setTaskNotificationData([]);
    updateTaskNotificationContent(taskId);
}
var taskNotificationDialog_lastUsedTaskId = null;
var updateTaskNotificationContent = function(taskId = null) {
    if (taskId == null)
        taskId = taskNotificationDialog_lastUsedTaskId;
    taskNotificationDialog_lastUsedTaskId = taskId;
    _bl.peekTaskNotificationBatch(taskId, 0, 1000);
}
var flushTaskNotificationContent = function(taskId) {
    if (taskId == null)
        taskId = taskNotificationDialog_lastUsedTaskId;
    taskNotificationDialog_lastUsedTaskId = taskId;
    _bl.flushTaskNotificationBatch(taskId, 1000);
}

var notificationAddEntryDialog = null;
var lastAddCallbackInNotificationAddEntryDialog = null;
var lastDeviceIdInNotificationAddEntryDialog = null;
var chipCallbackInNotificationAddEntryDialog = function(content) {
    if (lastAddCallbackInNotificationAddEntryDialog != null)
        lastAddCallbackInNotificationAddEntryDialog(content);
    $("#notificationAddEntryDialog_txtData").val("");
    notificationAddEntryDialog.close();
}
var showNotificationAddEntryDialog = function(deviceId, templateStringList, addCallback = null) {
    console.log("[INFO] UI showNotificationAddEntryDialog, deviceId", deviceId, ", templateStringList", templateStringList);
    lastDeviceIdInNotificationAddEntryDialog = deviceId;
    var chipTemplate = '<span class="mdl-chip" onclick="chipCallbackInNotificationAddEntryDialog(\'{{content}}\')">\
                        <span class="mdl-chip__text">{{content}}</span></span>';
    var templatesHtml = '';
    if (templateStringList != null) {
        for (var templateString of templateStringList) {
            var htmlSnippet = chipTemplate.replace('{{content}}', templateString)
                                            .replace('{{content}}', templateString);
            templatesHtml = templatesHtml + " " + htmlSnippet;
        }
    }
    lastAddCallbackInNotificationAddEntryDialog = addCallback;
    $("#notificationAddEntryDialog_templates").html(templatesHtml);
    notificationAddEntryDialog.showModal();
}

var taskNotificationList = [];
var refreshTaskNotificationUI = function() {
    var htmlContent = "";
    for (var notificationText of taskNotificationList) {
        htmlContent += createNotificationContent(notificationText, "margin-top: 0px; width: calc(100% - 15px)");
    }
    $("#TaskNotificationSpace").html(htmlContent);
}
var setTaskNotificationData = function(stringList) {
    taskNotificationList = stringList;
    refreshTaskNotificationUI();
}

var actionConfirmDialog = null;
var actionConfirmDialog_choiceYesCallback = function() {
    console.error("[INFO] UI actionConfirmDialog_choiceYesCallback, needs overridden");
}
var showActionConfirmDialog = function(choiceYesCallback) {
    console.log("[INFO] UI showActionConfirmDialog");
    if (choiceYesCallback != null)
        actionConfirmDialog_choiceYesCallback = choiceYesCallback;
    actionConfirmDialog.showModal();
}

var loginDialog = null;
var showLoginDialog = function() {
    console.log("[INFO] UI showLoginDialog");
    loginDialog.showModal();
}

var loginDialogWithClose = null;
var showloginDialogWithClose = function(timeoutSeconds = 0) {
    console.log("[INFO] UI loginDialogWithClose show")
    loginDialogWithClose.showModal();

    if (timeoutSeconds > 0)
        setTimeout(hideloginDialogWithClose, timeoutSeconds * 1000);
};
var hideloginDialogWithClose = function() {
    console.log("[INFO] UI loginDialogWithClose hide");
    loginDialogWithClose.close();
};

var loginErrorDialog = null;
var showLoginErrorDialog = function(timeoutSeconds = 0) {
    console.log("[INFO] UI loginErrorDialog show")
    loginErrorDialog.showModal();
};
var hideLoginErrorDialog = function() {
    console.log("[INFO] UI loginErrorDialog hide");
    loginErrorDialog.close();
    showLoginDialog();
};

var loginSuccessDialog = null;
var intialization_hitCount = 0;
var intialization_currentCount = 0;
var statusIconOnFinish = "done"; // Other options "clear"
var showLoginSuccessDialog = function(timeoutSeconds = 0) {
    console.log("[INFO] UI loginSuccessDialog show");
    loginSuccessDialog.querySelector('#loginSuccessDialog_progress').MaterialProgress.setBuffer(0);
    loginSuccessDialog.querySelector('#loginSuccessDialog_progress').MaterialProgress.setProgress(0);
    loginSuccessDialog.showModal();
    statusIconOnFinish = "done";

    if (timeoutSeconds > 0)
        setTimeout(hideLoginSuccessDialog, timeoutSeconds * 1000);
};
var setTotalAppInitialization = function(totalValue) {
    console.log("\t[INFO] UI setTotalAppInitialization", totalValue);
    intialization_hitCount = totalValue;
    intialization_currentCount = 0;
};
var contributeToAppInitializationError = function() {
    console.log("\t[INFO] UI contributeToAppInitializationError");
    statusIconOnFinish = "clear";
    loginSuccessDialog.querySelector('#loginSuccessDialog_intialization').innerHTML = statusIconOnFinish;
};
var contributeToAppInitialization = function() {
    console.log("\t[INFO] UI contributeToAppInitialization");
    intialization_currentCount++;
    updateAppInitializationProgress();
    if (intialization_currentCount == intialization_hitCount) {
        loginSuccessDialog.querySelector('#loginSuccessDialog_intialization').innerHTML = statusIconOnFinish;
        setTimeout(hideLoginSuccessDialog, 500);
    }
};
var updateAppInitializationProgress = function() {
    console.log("[INFO] UI updateAppInitializationProgress ");
    var value = Math.floor(intialization_currentCount * 100 / intialization_hitCount);
    loginSuccessDialog.querySelector('#loginSuccessDialog_progress').MaterialProgress.setBuffer(value);
    loginSuccessDialog.querySelector('#loginSuccessDialog_progress').MaterialProgress.setProgress(0);
};
var hideLoginSuccessDialog = function() {
    console.log("[INFO] UI loginSuccessDialog hide");
    loginSuccessDialog.close();
};


var wikiNewArticleDialog = null;
var showWikiNewArticleDialog = function() {
    console.log("[INFO] UI showWikiNewArticleDialog");
    $('#wikiNewArticleDialog_txtArticleName')[0].parentElement.MaterialTextfield.change("");
    wikiNewArticleDialog.showModal();
}

var appIcon = null;
var setAppIconRed = function() {
    console.log("[INFO] UI setAppIconRed");
    $("#appIcon").css("color", "red");
    $("#wiki-icon").css("color", "red");
}
var setAppIconWhite = function() {
    console.log("[INFO] UI setAppIconWhite");
    $("#appIcon").css("color", "white");
    $("#wiki-icon").css("color", "black");
}
var setAppIconPale = function() {
    console.log("[INFO] UI setAppIconPale");
    $("#appIcon").css("color", "goldenrod");
    $("#wiki-icon").css("color", "goldenrod");
}


var setUserInputText = function(text) {
    console.log("[INFO] setUserInputText, " + text);
    $('#queryToPrivate')[0].parentElement.MaterialTextfield.change(text);
}
var scrollInteractionChatSpaceSmoothToBottom = function() {
    console.log("[INFO] scrollInteractionChatSpaceSmoothToBottom");
    var id = "InteractionChatSpace";
    var div = document.getElementById(id);
    $('#' + id).animate({
       scrollTop: div.scrollHeight - div.clientHeight
    }, 250);
}

privateChat = [];
var autoAdjustInteractionChatSpaceHeight = function() {
    $(".InteractionChatSpace").css('height', window.innerHeight - 274);
}
var clearInteractionChatSpace = function() {
    console.log("[INFO] clearInteractionChatSpace");
    privateChat = [];
    refreshInteractionChatSpace();
}
var refreshInteractionChatSpace = function() {
    console.log("[INFO] refreshInteractionChatSpace");
    var content = "";
    if (privateChat.length > AppSetting_privateChatMaxSize) {
        var diffCount = privateChat.length - AppSetting_privateChatMaxSize;
        privateChat.slice(diffCount, privateChat.length);
    }
    privateChat.forEach(element => {
        content += element;
    });
    $("#InteractionChatSpace").html(content);
    scrollInteractionChatSpaceSmoothToBottom();
}
var appendPrivateResponseText = function(text) {
    console.log("[INFO] appendPrivateResponseText, " + text);
    
    var d = new Date();
    content = '<div style="width: 85%;" class="section__text mdl-cell mdl-cell--10-col-desktop mdl-cell--6-col-tablet mdl-cell--3-col-phone"> \
        <h5>@Private/' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '</h5> \
        ' + text + ' \
    </div>';

    privateChat.push(content);
    refreshInteractionChatSpace();
}
var createNotificationContent = function(data, additionalCss) {
    var d = new Date();
    content = '<div style="{additionalcss};" class="notificationText section__text mdl-cell mdl-cell--10-col-desktop mdl-cell--6-col-tablet mdl-cell--3-col-phone"> \
        <h5>@Notification/{hours}:{minutes}:{seconds}</h5> \
        {data} \
    </div>';
    content = replaceAll(content, '{additionalcss}', additionalCss);
    content = replaceAll(content, '{data}', data);
    content = replaceAll(content, '{hours}', d.getHours());
    content = replaceAll(content, '{minutes}', d.getMinutes());
    content = replaceAll(content, '{seconds}', d.getSeconds());
    return content;
}
var appendNotificationText = function(text) {
    console.log("[INFO] appendNotificationText, " + text);
    content = createNotificationContent(text, 'width: 85%');
    privateChat.push(content);
    refreshInteractionChatSpace();
}
var processNotificationText = function(text) {
    appendNotificationText(text);
    
    var data = JSON.parse(text);
    if (data["type"].trim().toLowerCase() == "chime") {
        playChime();
    }
}
var appendUserInputText = function(text) {
    console.log("[INFO] appendUserInputText, " + text);
    
    var d = new Date();
    content = '<div style="width: calc(100% - 20px);" class="userText section__text mdl-cell mdl-cell--10-col-desktop mdl-cell--6-col-tablet mdl-cell--3-col-phone"> \
        <h5>Me/' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '</h5> \
        ' + text + ' \
    </div>';

    privateChat.push(content);
    refreshInteractionChatSpace();
}


animTranscriptionResultConfirmationWithTimeout = [];
transcriptionResultConfirmationWithTimeout = null;
var clearTranscriptionResultDialog = function() {
    if (transcriptionResultConfirmationWithTimeout != null) {
        clearTimeout(transcriptionResultConfirmationWithTimeout);
        console.log("[INFO] Timeout cleared setTranscriptionResultConfirmationWithTimeout");
        transcriptionResultConfirmationWithTimeout = null;
        animTranscriptionResultConfirmationWithTimeout.forEach(element => {
            clearTimeout(element);
        });
        animTranscriptionResultConfirmationWithTimeout = [];
    }
    transcriptionResultDialog.close();
}
var setTranscriptionResultConfirmationWithTimeout_confirmed = function(text) {
    console.log("[INFO] setTranscriptionResultConfirmationWithTimeout_confirmed, ", text);
    transcriptionResultDialog = document.getElementById('transcriptionResultDialog');
    transcriptionResultDialog.close();

    transcriptionResultConfirmationWithTimeout = null;
    animTranscriptionResultConfirmationWithTimeout = [];

    _bl.sendUserInput(text);
}
var setTranscriptionResultConfirmationWithTimeout_timeoutHelper = function(value) {
    console.log("[INFO] setTranscriptionResultConfirmationWithTimeout_timeoutHelper, " + value);
    transcriptionResultDialog.querySelector('#transcriptionResultDialog_progress').MaterialProgress.setProgress(value);
    transcriptionResultDialog.querySelector('#transcriptionResultDialog_progress').MaterialProgress.setBuffer(value);
}
var setTranscriptionResultConfirmationWithTimeout = function(text) {
    console.log("[INFO] setTranscriptionResultConfirmationWithTimeout, ", text);

    if (text.toString().trim() == "") {
        console.log("[INFO] cancel process, text blank, setTranscriptionResultConfirmationWithTimeout, ", text);
        return;
    }

    transcriptionResultDialog = document.getElementById('transcriptionResultDialog');
    if (! transcriptionResultDialog.showModal) {
        dialogPolyfill.registerDialog(transcriptionResultDialog);
    }
    transcriptionResultDialog.showModal();
    transcriptionResultDialog.querySelector('#transcriptionResultDialog_text').innerHTML = text;
    transcriptionResultDialog.querySelector('.close').addEventListener('click', function() {
        clearTranscriptionResultDialog();
    });
    transcriptionResultDialog.querySelector('#transcriptionResultDialog_progress').MaterialProgress.setProgress(0);
    transcriptionResultDialog.querySelector('#transcriptionResultDialog_progress').MaterialProgress.setBuffer(0);
    var endIndex = 5;
    var timeSlice = 700;
    for (var i = 1; i <= endIndex; i++) {
        animTranscriptionResultConfirmationWithTimeout.push(setTimeout(
            setTranscriptionResultConfirmationWithTimeout_timeoutHelper, i * timeSlice, i * 20
        ));
    }
    transcriptionResultConfirmationWithTimeout = setTimeout(setTranscriptionResultConfirmationWithTimeout_confirmed, 
                                                    i * timeSlice, text);
}

var contentKeyToPropertyContentMap = {};
var setDeviceListContent = function(deviceList, values) {
    console.log("[INFO] UI setDeviceListContent", deviceList, values);

    contentKeyToPropertyContentMap = {};
    for (var i = 0; i < deviceList.length; i++) {
        contentKeyToPropertyContentMap[deviceList[i]] = values[i];
    }

    var deviceHeaderMap = {};
    for (var deviceEntry of deviceList) {
        var deviceData = deviceEntry.split('/');
        var deviceHeaderArr = deviceData.slice(0, deviceData.length - 1);
        var deviceHeader = deviceHeaderArr.join('/');
        var property = deviceData[deviceData.length - 1];
        
        if (deviceHeader in deviceHeaderMap)
            deviceHeaderMap[deviceHeader].push(property);
        else
            deviceHeaderMap[deviceHeader] = [property];
    }
    console.log('\t[INFO] UI setDeviceListContent.deviceHeaderMap', deviceHeaderMap);

    var content = "";
    var tableTemplate = '<table id="DeviceListTable" class="mdl-data-table mdl-js-data-table">\
        <tbody>\
            {tableRow}\
        </tbody>\
    </table>';
    var tableRowTemplate = '<tr>\
        <td class="mdl-data-table__cell--non-numeric">{deviceid}</td>\
        <td style="text-align: left;">{devicedescription}</td>\
    </tr>';
    var chipTemplate = '<span class="mdl-chip mdl-chip--contact" onclick="showDevicePropertyContent(\'{propertyContent}\');">\
        <span class="mdl-chip__contact mdl-color--indigo mdl-color-text--white">\
            <i class="material-icons icon">navigate_next</i>\
        </span>\
        <span class="mdl-chip__text">{content}</span>\
    </span>&nbsp;';
    var tableRowContent = "";
    for (var deviceid in deviceHeaderMap) {
        var formattedDeviceId = deviceid.split('/');
        formattedDeviceId[formattedDeviceId.length - 1] = "<br/>&nbsp;&nbsp;&nbsp;&nbsp;<b>" 
            + formattedDeviceId[formattedDeviceId.length - 1]
            + "</b>";
        formattedDeviceId = formattedDeviceId.join('/');
        var tableRow = tableRowTemplate.replace('{deviceid}', formattedDeviceId);
        var rowPropertyContent = '';
        var deviceList = deviceHeaderMap[deviceid].sort();
        var i = 0;
        for (var property of deviceHeaderMap[deviceid]) {
            i++;
            var contentKey = deviceid + "/" + property;
            rowPropertyContent += chipTemplate.replace('{content}', property)
                                    .replace('{propertyContent}', contentKey);
            if (i == 4) {
                rowPropertyContent += "<br/>";
                i = 0;
            }
        }
        tableRow = tableRow.replace('{devicedescription}', rowPropertyContent);
        tableRowContent += tableRow;
    }
    content = tableTemplate.replace('{tableRow}', tableRowContent);
    $("#DeviceListTable").html(content);
}
var showDevicePropertyContent = function(contentKey) {
    console.log("[INFO] UI setting showDevicePropertyContent");
    var txt = contentKeyToPropertyContentMap[contentKey];
    $("#device_propertyContent").html(txt);
    document.querySelectorAll('#device_propertyContent').forEach((block) => {
        hljs.highlightBlock(block);
    });
}

var autoAdjustQueueDataHeight = function() {
    $(".QueueData").css('height', window.innerHeight - 220);
}

var autoAdjustWikiDataHeight = function() {
    $(".WikiData").css('height', window.innerHeight - 220);
}


var drawDebugCallstackWidget = function(treantGraphData) {
    var simple_chart_config = {
        chart: {
            container: "#debug_callstack"
        },
        
        nodeStructure: treantGraphData
    };
    var my_chart = new Treant(simple_chart_config, scrollbar="native");
}

var debugRangeSliderEl;
var debugRangeSlider = null;
var drawDebugRangeSliderWidget = function(startPos, endPos, totalCount, isDisabled) {
    if (debugRangeSlider != null)
        debugRangeSliderEl.noUiSlider.destroy();

    valuesRange = [];
    targetTotalPips = 25;
    minTotalPips = 10;
    // Try finding a whole number
    gap = totalCount/targetTotalPips;
    if (gap != Math.floor(gap)) {
        for (i = targetTotalPips - 1; i >= minTotalPips; i--) {
            tempGap = i/targetTotalPips;
            if (tempGap == Math.floor(tempGap)) {
                gap = tempGap;
                break;
            }
        }
    }
    for (i = 0; i < totalCount; i += gap) {
        valuesRange.push(Math.floor(i));
    }
    valuesRange.push(totalCount);

    debugRangeSlider = noUiSlider.create(debugRangeSliderEl, {
        start: [startPos, endPos],
        connect: true,
        step: 1,
        orientation: 'horizontal', // 'horizontal' or 'vertical'
        range: {
            'min': 0,
            'max': totalCount - 1,
        },
        behaviour: 'tap-drag',
        pips: {
            mode: 'values',
            values: valuesRange,
            density: totalCount * 2
        },
        tooltips: false
    });

    debugRangeSliderEl.noUiSlider.on('update.one', 
        function(values, handle, unencoded, tap, positions, noUiSlider) {
            console.log("[INFO] UI drawDebugRangeSliderWidget debugRangeSlider", values);
            var startPos = parseFloat(values[0]);
            var endPos = parseFloat(values[1]);

            _bl.queryDebugData(startPos, endPos, 3);
        });

    if (isDisabled)
        debugRangeSliderEl.setAttribute('disabled', true);
    else
        debugRangeSliderEl.removeAttribute('disabled');
}

var showDebugLastError = function(txt) {
    console.log("[INFO] UI setting showDebugLastError");
    $("#debug_lastErrorContent").html(txt);

    document.querySelectorAll('#debug_lastErrorContent').forEach((block) => {
        hljs.highlightBlock(block);
    });
}

var setDebugModeUI = function(enable) {
    console.log("[INFO] UI setting setDebugModeUI");
    if (enable) {
        $("#debug_btnStartLogging").hide();
        $("#debug_btnStopLogging").show();
    }
    else {
        $("#debug_btnStartLogging").show();
        $("#debug_btnStopLogging").hide();
    }
}

var scrollToTaskManagerView = function() {
    $('.mdl-layout').animate({
        scrollTop: $("#taskmanager").offset().top
    }, 500);
}

var showTaskContentPreview = function(content) {
    console.log("[INFO] UI setting showTaskContentPreview");
    $("#task_previewContent").html(content);
    document.querySelectorAll('#task_previewContent').forEach((block) => {
        hljs.highlightBlock(block);
    });
    var id = "TaskPreviewCard";
    var div = document.getElementById(id);
    $('.mdl-layout').animate({
        scrollTop: $("#" + id).offset().top
    }, 500);
}

var lastTaskId_taskContentPreviewByTaskId = "";
var showTaskContentPreviewByTaskId = function(taskId) {
    console.log("\t[INFO] UI showTaskContentPreviewByTaskId ", taskId);
    lastTaskId_taskContentPreviewByTaskId = taskId;
    var task = tasklistMap[taskId];
    var value = "";
    var key = "snippet";
    if (key in task) value = task[key];
    showTaskContentPreview(value);
}
var editTaskSnippetInPreviewWithMonacoEditor = function() {
    showMonacoEditorByTaskId(lastTaskId_taskContentPreviewByTaskId);
}

var taskId_currentMonacoEditor = "";
var showMonacoEditorByTaskId = function(taskId) {
    console.log("\t[INFO] UI showMonacoEditorByTaskId ", taskId);
    if (!(taskId in tasklistMap)) return;

    taskId_currentMonacoEditor = taskId;
    var task = tasklistMap[taskId];
    var value = "";
    var taskName = "";
    var key = "name";
    if (key in task) taskName = task[key];
    var key = "snippet";
    if (key in task) value = task[key];

    var runTaskTemplate = '<button id="runTaskTemplate_btnRunTask" class="mdl-button mdl-js-button mdl-button--accent mdl-js-ripple-effect">\
            <i class="material-icons" style="padding-top: 0px;">play_arrow</i> Run\
        </button>';
    var showNotificationListTemplate = '<button id="runTaskTemplate_btnShowNotificationList" class="mdl-button mdl-js-button mdl-button--primary mdl-js-ripple-effect">\
            <i class="material-icons" style="padding-top: 2px;">sms_failed</i> Messages\
        </button>';
    var combinedAdditionalUI = "&nbsp;&nbsp;&nbsp;&nbsp;" + runTaskTemplate + showNotificationListTemplate;
    showMonacoEditor(value, taskMonacoEditorSaveFunction, 
        taskMonacoEditorShowInfoFunction, combinedAdditionalUI);
    taskAddListenerForRunTaskTemplate(taskId, taskName);
    taskAddListenerForShowNotificationListTemplate(taskId, taskName);
}
var taskAddListenerForRunTaskTemplate = function(taskId, taskName) {
    var button = document.getElementById('runTaskTemplate_btnRunTask');
    componentHandler.upgradeElement(button);

    $("#runTaskTemplate_btnRunTask").click(function() {
        _bl.sendUserInput(taskName);
    });
}
var taskAddListenerForShowNotificationListTemplate = function(taskId, taskName) {
    var button = document.getElementById('runTaskTemplate_btnShowNotificationList');
    componentHandler.upgradeElement(button);
    
    $("#runTaskTemplate_btnShowNotificationList").click(function() {
        showTaskNotificationDialog(taskId, taskName);
    });
}
var taskMonacoEditorSaveFunction = function(content) {
    _bl.setTaskSnippet(taskId_currentMonacoEditor, content);
}
var taskMonacoEditorShowInfoFunction = function(content) {
    showPleaseWaitDialog();
    $("#taskSdkInfoContent").html("Fetching content");
    _bl.fetchSdkInfoContent(function(content) {
        content = replaceAll(content, '\n', '<br/>');
        $("#taskSdkInfoContent").html(content);
        hidePleaseWaitDialog();
        showTaskSdkInfoDialog();
    }, function() {
        hidePleaseWaitDialog();
    });
}

var deleteByTaskId = function(taskId, customCallbackOnSuccess = null) {
    console.log("[INFO] UI deleteByTaskId ", taskId);
    showActionConfirmDialog(function() {
        console.log("[INFO] UI customCallbackOnSuccess on choice yes", taskId);
        _bl.deleteTask(taskId);

        if (customCallbackOnSuccess != null)
            customCallbackOnSuccess();
    });
}

showTaskMetadataEditorDialogByTaskId = function(taskId) {
    console.log("\t[INFO] UI showTaskMetadataEditorDialogByTaskId ", taskId);
    var task = tasklistMap[taskId];
    showTaskMetadataEditorDialog(task);
}

var tasklistMap = {};
var showTaskListUI = function(tasklist) {
    console.log("[INFO] UI showTaskListUI incomplete");

    tasklistMap = {};
    tasklist.sort(function(a, b) {
        if (a["name"] < b["name"])
            return -1;
        if (a["name"] > b["name"])
            return 1;
        return 0;
    });
    for (var task of tasklist) {
        var id = task["id"];
        tasklistMap[id] = task;
    }

    var syncRuntypeUITemplate = '<span class="mdl-chip syncStatusChip">\
                                    <span class="mdl-chip__text">SYNC</span>\
                                </span>';
    var asyncRuntypeUITemplate = '<span class="mdl-chip asyncStatusChip">\
                                        <span class="mdl-chip__text">ASYNC</span>\
                                    </span>';
    var tableTemplate = '<table class="mdl-data-table mdl-js-data-table" style="margin: 0 auto;">\
                            <tbody style="height: 200px; overflow: auto;">{row}</tbody></table>';
    var runIcon = '<span style="font-size: 35px; color: lightgreen;" class="material-icons">\
                        directions_run\
                    </span>';
    var blankRunIcon = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
    var rowTemplate = '<tr style="border-style: hidden; box-shadow: 0 0 5px 0px rgba(0, 0, 0, 0.07);">\
                        <td>{runicon}</td>\
                        <td style="text-align:left;">\
                        <b>{name}</b>\
                        <br/>\
                        {description}\
                        <input type="hidden" value="{taskid}" />\
                        </td>\
                        <td style="background: aliceblue; text-align: left;">\
                            <span class="mdl-chip mdl-chip--contact" style="background: aliceblue;">\
                                <span class="mdl-chip__contact mdl-color--blue mdl-color-text--white">\
                                <span class="material-icons" style="padding-top: 5px;">alarm</span>\
                            </span>\
                            <span class="mdl-chip__text">{timeout}</span>\
                        </span>\
                        </td>\
                        <td>\
                        {runtype}\
                        <br/>\
                        <span class="mdl-chip">\
                            <span class="mdl-chip__text">{status}</span>\
                        </span>\
                        </td>\
                        <td>\
                        <button onclick="showTaskContentPreviewByTaskId(\'{taskid}\');" class="mdl-button mdl-js-button mdl-button--icon mdl-button--primary">\
                            <i class="material-icons">remove_red_eye</i>\
                        </button>\
                        <button id="more_task_action_{taskid}" class="mdl-button mdl-js-button mdl-button--icon  mdl-button--primary">\
                            <i class="material-icons">more_horiz</i>\
                        </button>\
                        <ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="more_task_action_{taskid}">\
                            <li onclick="showMonacoEditorByTaskId(\'{taskid}\');" class="mdl-menu__item">\
                                <span><i class="material-icons">edit_road</i></span> <span>Edit script</span>\
                            </li>\
                            <li onclick="showTaskInputQueueDialog(\'{taskid}\', \'{name}\');" class="mdl-menu__item">\
                                <span><i class="material-icons">build</i></span> <span>Push control message</span>\
                            </li>\
                        </ul>\
                        <br/>\
                        <button onclick="showTaskMetadataEditorDialogByTaskId(\'{taskid}\');" class="mdl-button mdl-js-button mdl-button--icon mdl-button--primary">\
                            <i class="material-icons">edit</i>\
                        </button>\
                        <button onclick="showTaskNotificationDialog(\'{taskid}\', \'{name}\')" class="mdl-button mdl-js-button mdl-button--icon mdl-button--primary">\
                            <i class="material-icons">sms_failed</i>\
                        </button>\
                        </td>\
                    </tr>\
                    <tr style="height: 10px;"></tr>';

    var combinedRow = '';
    for (task of tasklist) {
        var runtype = syncRuntypeUITemplate;
        if (task["runtype"] == "ASYNC")
            runtype = asyncRuntypeUITemplate;

        var row = rowTemplate;
        row = replaceAll(row, '{runtype}', runtype);
        row = replaceAll(row, '{taskid}', task["id"]);
        row = replaceAll(row, '{name}', task["name"]);
        row = replaceAll(row, '{description}', task["description"]);
        row = replaceAll(row, '{status}', task["status"]);
        if (task["status"] == "RUN")
            row = row.replace('{runicon}', runIcon);
        else
            row = row.replace('{runicon}', blankRunIcon);
        row = row.replace('{timeout}', task["timeout"]);
        combinedRow += row + '\n';
    }
    var tableHtml = tableTemplate.replace('{row}', combinedRow);
    $("#TaskListTable").html(tableHtml);

    // Expand MDL
    componentHandler.upgradeDom();
}

var monacoEditor = null;
var lastMonacoContent = null;
var showMonacoEditor = function(content, saveCallback, showHelpCallback, additionalButtonTemplate = "") {
    console.log("[INFO] UI setting showMonacoEditor");
    $("#monaco-editor-ui").show();
    $("#monaco-editor-ui-additional-space").html(additionalButtonTemplate);
    lastMonacoContent = content;
    if (monacoEditor != null) monacoEditor.dispose();
    var lines = content.split("\r\n");
    if (lines.length <= 1)
        lines = content.split("\n");
    monacoEditor = monaco.editor.create(document.getElementById('monaco-container'), {
		value: content,
		language: 'python'
    });
    saveMonacoEditorContentCustom = saveCallback;
    showHelpMonacoEditorContentCustom = showHelpCallback;
}

var saveMonacoEditorContentCustom = function(content) {
    alert("This function needs to be overridden to save contents");
    console.log("[INFO] UI setting saveMonacoEditorContentCustom, needs to be overridden", content);
}
var saveMonacoEditorContent = function() {
    console.log("[INFO] UI setting saveMonacoEditorContent");
    var content = monacoEditor.getValue();
    if (saveMonacoEditorContentCustom != null)
        saveMonacoEditorContentCustom(content);
}

var showHelpMonacoEditorContentCustom = function(content) {
    alert("This function needs to be overridden to save contents");
    console.log("[INFO] UI setting showHelpMonacoEditorContentCustom, needs to be overridden", content);
}
var showHelpMonacoEditorContent = function() {
    console.log("[INFO] UI setting showHelpMonacoEditorContent");
    var content = monacoEditor.getValue();
    if (showHelpMonacoEditorContentCustom != null)
        showHelpMonacoEditorContentCustom(content);
}

var resetMonacoEditorContent = function() {
    console.log("[INFO] UI setting resetMonacoEditorContent");
    showActionConfirmDialog(function() {
        showMonacoEditor(lastMonacoContent, saveMonacoEditorContentCustom, showHelpMonacoEditorContentCustom);
    });
}

var closeMonacoEditor = function() {
    console.log("[INFO] UI setting closeMonacoEditor");
    $("#monaco-editor-ui").hide();
}

var listBinariesToDownload = function(listOfLinks) {
    console.log("[INFO] UI listBinariesToDownload");
    $("#task_downloadbinaries_table tr").remove();
    for (var link of listOfLinks) {
        $("#task_downloadbinaries_table > tbody:last-child")
            .append(('<tr><td style="padding: 5px;"><span class="mdl-chip"><span class="mdl-chip__text">'
                    + '<a class="task_downloadbinaries_link" target="_blank" href="{{link}}">{{link}}</a>'
                    + '</span></span></td></tr>')
                .replace('{{link}}', link)
                .replace('{{link}}', link)
            );
    }
}

wikiTable = [];
var clearWikiData = function() {
    console.log("[INFO] clearWikiData");
    wikiTable = [];
    refreshWikiData();
}
var refreshWikiData = function() {
    console.log("[INFO] refreshWikiData");
    var content = "";
    if (wikiTable.length > AppSetting_wikiTableMaxSize) {
        var diffCount = wikiTable.length - AppSetting_wikiTableMaxSize;
        wikiTable.slice(diffCount, wikiTable.length);
    }
    wikiTable.forEach(element => {
        content += element;
    });
    $("#WikiData").html(content);
}
var appendWikiArticleText = function(index, articleName, previewText) {
    console.log("[INFO] appendArticleText, index=" + index);
    
    var d = new Date();
    content = '<div style="width: auto; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;" class="section__text mdl-cell mdl-cell--10-col-desktop mdl-cell--6-col-tablet mdl-cell--3-col-phone" onclick="_bl.blShowArticle(' + index + ')"> \
        <h5>' + articleName + '/' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '</h5> \
        ' + previewText + ' \
    </div>';

    wikiTable.push(content);
    refreshWikiData();
}
// var createArticleRowContent = function(data, additionalCss) {
//     var d = new Date();
//     content = '<div style="{additionalcss};" class="notificationText section__text mdl-cell mdl-cell--10-col-desktop mdl-cell--6-col-tablet mdl-cell--3-col-phone"> \
//         <h5>@Article/{hours}:{minutes}:{seconds}</h5> \
//         {data} \
//     </div>';
//     content = replaceAll(content, '{additionalcss}', additionalCss);
//     content = replaceAll(content, '{data}', data);
//     content = replaceAll(content, '{hours}', d.getHours());
//     content = replaceAll(content, '{minutes}', d.getMinutes());
//     content = replaceAll(content, '{seconds}', d.getSeconds());
//     return content;
// }
// var appendArticleRowText = function(text) {
//     console.log("[INFO] appendNotificationText, " + text);
//     content = createArticleRowContent(text, 'width: 100%');
//     wikiTable.push(content);
//     refreshWikiData();
// }
var lastMarkdownContent = null;
var showMarkdownEditor = function(titleContentPair, saveCallback, deleteCallback, previousCallback, nextCallback, additionalButtonTemplate = "") {
    console.log("[INFO] UI setting showMarkdownEditor");
    $("#markdown-editor-ui").show();
    $("#markdown-editor-ui-additional-space").html(additionalButtonTemplate);
    lastMarkdownContent = titleContentPair;
    $("#markdown-container").val(titleContentPair.content);
    $("#markdown-editor-title").html(titleContentPair.title);
    saveMarkdownEditorContentCustom = saveCallback;
    deleteMarkdownEditorContentCustom = deleteCallback;
    previousMarkdownEditorContentCustom = previousCallback;
    nextMarkdownEditorContentCustom = nextCallback;
    
    autoAdjustMarkdownEditor();
}

var previousMarkdownEditorContentCustom = function(titleContentPair) {
    alert("This function needs to be overridden to save contents");
    console.log("[INFO] UI setting previousMarkdownEditorContentCustom, needs to be overridden", titleContentPair);
}
var nextMarkdownEditorContentCustom = function(titleContentPair) {
    alert("This function needs to be overridden to save contents");
    console.log("[INFO] UI setting nextMarkdownEditorContentCustom, needs to be overridden", titleContentPair);
}

var saveMarkdownEditorContentCustom = function(titleContentPair) {
    alert("This function needs to be overridden to save contents");
    console.log("[INFO] UI setting saveMarkdownEditorContentCustom, needs to be overridden", titleContentPair);
}
var saveMarkdownEditorContent = function() {
    console.log("[INFO] UI setting saveMarkdownEditorContent");
    var content = $("#markdown-container").val();
    lastMarkdownContent["content"] = content;
    
    $("#markdown-auto-next-label").html("00");
    $("#markdown-auto-next-slider").get(0).MaterialSlider.change(0);
    
    if (saveMarkdownEditorContentCustom != null)
        saveMarkdownEditorContentCustom(lastMarkdownContent);
}


var prevMarkdownEditorContent = function() {
    console.log("[INFO] UI setting prevMarkdownEditorContent");
    if (previousMarkdownEditorContentCustom != null)
        previousMarkdownEditorContentCustom();
}
var nextMarkdownEditorContent = function() {
    console.log("[INFO] UI setting nextMarkdownEditorContent");
    if (nextMarkdownEditorContentCustom != null)
        nextMarkdownEditorContentCustom();
}

var resetMarkdownEditorContent = function() {
    console.log("[INFO] UI setting resetMarkdownEditorContent");
    
    $("#markdown-auto-next-label").html("00");
    $("#markdown-auto-next-slider").get(0).MaterialSlider.change(0);
    
    showActionConfirmDialog(function() {
        showMarkdownEditor(lastMarkdownContent, saveMarkdownEditorContentCustom, deleteMarkdownEditorContentCustom, previousMarkdownEditorContentCustom, nextMarkdownEditorContentCustom);
    });
}

var deleteMarkdownEditorContent = function() {
    console.log("[INFO] UI setting deleteMarkdownEditorContent");
    
    $("#markdown-auto-next-label").html("00");
    $("#markdown-auto-next-slider").get(0).MaterialSlider.change(0);
    
    showActionConfirmDialog(function() {
        if (deleteMarkdownEditorContentCustom != null)
            deleteMarkdownEditorContentCustom(lastMarkdownContent);
    });
}
var deleteMarkdownEditorContentCustom = function(titleContentPair) {
    alert("This function needs to be overridden to delete contents");
    console.log("[INFO] UI setting deleteMarkdownEditorContentCustom, needs to be overridden", titleContentPair);
}

var closeMarkdownEditor = function() {
    console.log("[INFO] UI setting closeMarkdownEditor");
    $("#markdown-auto-next-label").html("00");
    $("#markdown-auto-next-slider").get(0).MaterialSlider.change(0);
    $("#markdown-editor-ui").hide();
}
    
function trbl(e, relative) {
    var r = $(e).get(0).getBoundingClientRect(); relative = $(relative);

    return {
        t : r.top    + relative['scrollTop'] (),
        r : r.right  + relative['scrollLeft'](),
        b : r.bottom + relative['scrollTop'] (),
        l : r.left   + relative['scrollLeft']()
    }
}

var autoAdjustMarkdownEditor = function() {
    var toolHeight = $("#markdown-toolbar").children()[0].clientHeight;
    var totalToolbarHeight = toolHeight;
    var toolbarWidth = $("#markdown-toolbar").width();
    var totalChildWidth = 0;
    for (var childTag of $("#markdown-toolbar").children()) {
        if ("id" in childTag && !!childTag["id"] && childTag["id"].length > 0) {
            var width = childTag.clientWidth;
            totalChildWidth += width;
            console.log(totalChildWidth, width);
            if (totalChildWidth > toolbarWidth) {
                totalChildWidth = width;
                totalToolbarHeight += toolHeight;
            }
        }
    }
    // CPPXAXA Height hack
    if (totalToolbarHeight != toolHeight) {
        // $("#markdown-toolbar").height((totalToolbarHeight + toolHeight*2) + "px");
        $("#markdown-toolbar").height((trbl("#markdown-auto-next-slider", document)["b"] - 20) + "px");
    }
    else {
        $("#markdown-toolbar").height(totalToolbarHeight + "px");
    }
    $("#markdown-container").css("top", (50 + document.getElementById("markdown-toolbar").clientHeight) + "px");
    $("#markdown-container").css("height", "calc(100% - " + (document.getElementById("markdown-toolbar").clientHeight + 105) + "px");
}

var chimeMp3 = new Audio("stuff/chime.mp3");
var playChime = function(count) {
    chimeMp3.play();
}

var hideCurtain = function() {
    $("#curtain").fadeOut(500);
}

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
};

var appModeArticles = function() {
    $("header").hide();
    $("#overview").hide();
    $("#taskmanager").hide();
    $("#debug").hide();
    
    $("#wiki").show();
    
    $("body").css("background", "white");
    
    $("#wiki-section").removeClass("section--center");
    $("#wiki-section").removeClass("mdl-grid");
    $("#wiki-section").removeClass("mdl-grid--no-spacing");
    $("#wiki-section").removeClass("mdl-shadow--8dp");

    $("#wiki-section-card").removeClass("mdl-card");
    $("#wiki-section-card").removeClass("mdl-cell");
    $("#wiki-section-card").removeClass("mdl-cell--12-col");

    $("#wiki-section-card-support").removeClass("mdl-card__supporting-text");
    $("#wiki-section-card-support").removeClass("mdl-grid");
    $("#wiki-section-card-support").removeClass("mdl-grid--no-spacing");

    $("#wiki-section-card-support-cell").removeClass("mdl-cell");
    $("#wiki-section-card-support-cell").removeClass("mdl-cell--12-col");
}

$(document).ready(function() {
    console.log("[INFO] UI Element Ready");
    
    $("#monaco-editor-btnclose").click(closeMonacoEditor);
    
    $("#markdown-editor-btnclose").click(closeMarkdownEditor);

    $("#startRecording").click(function() {
        console.log("[INFO] UI Start button tapped");
        _bl.controller.startWavRecording();
    });

    $("#stopRecording").click(function() {
        console.log("[INFO] UI Stop button tapped");
        _bl.controller.stopWavRecording();
    });


    console.log('[INFO] Auto adjust interaction chat space');
    autoAdjustInteractionChatSpaceHeight();
    
    $("#queryCard_btnFullscreen").click(function() {
        autoAdjustInteractionChatSpaceHeight();
    });
    $("#queryCard_sendUserInput").click(function() {
        text = $("#queryToPrivate").val();
        setUserInputText("");
        console.log("[INFO] UI queryCard_sendUserInput tapped, text: " + text);
        _bl.sendUserInput(text);
    });
    $("#InteractionChatSpace_ClearAll").click(function() {
        console.log("[INFO] UI InteractionChatSpace_ClearAll tapped");
        clearInteractionChatSpace();
    });

    $("#queryToPrivate").keypress(function(e) {
        if (event.which == 13) {
            event.preventDefault();

            console.log("[INFO] UI queryToPrivate text field pressed enter", e);
            text = $("#queryToPrivate").val();
            setUserInputText("");
            console.log("\t[INFO] UI queryToPrivate sending user input, text: " + text);
            _bl.sendUserInput(text);
        }
    });
    

    taskSdkInfoDialog = document.getElementById('taskSdkInfoDialog');
    if (!taskSdkInfoDialog.showModal) {
        dialogPolyfill.registerDialog(taskSdkInfoDialog);
    }
    taskSdkInfoDialog.querySelector('.close').addEventListener('click', function() {
        console.log("\t[INFO] UI TaskInfo window close");
        taskSdkInfoDialog.close();
    });

    
    taskNotificationDialog = document.getElementById('taskNotificationDialog');
    if (!taskNotificationDialog.showModal) {
        dialogPolyfill.registerDialog(taskNotificationDialog);
    }
    taskNotificationDialog.querySelector('.close').addEventListener('click', function() {
        console.log("\t[INFO] UI TaskNotificationDialog window close");
        taskNotificationDialog.close();
    });
    $("#taskNotificationDialog_btnFlushBatch").click(function() {
        console.log("[INFO] UI taskNotificationDialog_btnFlushBatch");
        flushTaskNotificationContent();
    });
    $("#taskNotificationDialog_btnRefreshBatch").click(function() {
        console.log("[INFO] UI taskNotificationDialog_btnRefreshBatch");
        updateTaskNotificationContent();
    });
    $("#taskNotificationDialog_btnAddEntry").click(function() {
        console.log("[INFO] UI taskNotificationDialog_btnAddEntry");
        var templateStringList = [
            "POISON PILL", "POWER SAVE", "NORMAL"
        ];
        showNotificationAddEntryDialog(lastDeviceIdInTaskNotificationDialog,
            templateStringList, function(content) {
            
            // alert('TODO ' + content + " " + lastDeviceIdInNotificationAddEntryDialog);
            _bl.pushNotificationData(lastDeviceIdInNotificationAddEntryDialog, { "content": content });
        });
    });

    notificationAddEntryDialog = document.getElementById('notificationAddEntryDialog');
    if (!notificationAddEntryDialog.showModal) {
        dialogPolyfill.registerDialog(notificationAddEntryDialog);
    }
    notificationAddEntryDialog.querySelector('.close').addEventListener('click', function() {
        console.log("\t[INFO] UI notificationAddEntryDialog window close");
        notificationAddEntryDialog.close();
    });
    $("#notificationAddEntryDialog_btnAdd").click(function() {
        var content = $("#notificationAddEntryDialog_txtData").val();
        chipCallbackInNotificationAddEntryDialog(content);
        notificationAddEntryDialog.close();
    });

    pleaseWaitDialog = document.getElementById('pleaseWaitDialog');
    if (!pleaseWaitDialog.showModal) {
      dialogPolyfill.registerDialog(pleaseWaitDialog);
    }
    pleaseWaitDialog.querySelector('.close').addEventListener('click', function() {
        console.log("\t[INFO] UI pleaseWait window close");
        pleaseWaitDialog.close();
    });


    actionConfirmDialog = document.getElementById('actionConfirmDialog');
    if (!actionConfirmDialog.showModal) {
      dialogPolyfill.registerDialog(actionConfirmDialog);
    }
    actionConfirmDialog.querySelector('.close').addEventListener('click', function() {
        console.log("[INFO] UI actionConfirmDialog No");
        actionConfirmDialog.close();
    });
    $("#actionConfirmDialog_btnYes").click(function() {
        console.log("[INFO] UI actionConfirmDialog Yes")
        actionConfirmDialog_choiceYesCallback();
        actionConfirmDialog.close();
    });


    loginDialog = document.getElementById('loginDialog');
    if (!loginDialog.showModal) {
      dialogPolyfill.registerDialog(loginDialog);
    }
    $("#loginButton").click(function() {
        console.log("[INFO] UI Login window show")
        loginDialog.showModal();
    });
    $("#loginWindow_btnLogin").click(function() {
        console.log("[INFO] UI Login window login request");
        _bl.logIntoServer($("#loginWindow_txtLoginUsername").val(), $("#loginWindow_txtLoginPassword").val());
    });
    $("#loginWindow_btnEngineeringApp").click(function() {
        console.log("[INFO] UI Login window engineering app");
        window.location = "index.html";
    });
    $("#loginWindow_btnArticlesApp").click(function() {
        console.log("[INFO] UI Login window articles app");
        window.location = "index.html?app=articles";
    });
    loginDialog.querySelector('.close').addEventListener('click', function() {
        console.log("[INFO] UI Login window close");
        loginDialog.close();
    });

    
    if (AppSetting_debugDisableLogin) {
        console.log("[INFO] Disabling UI Login window show at first due to AppSetting_debugDisableLogin");    
    }
    else {
        console.log("[INFO] UI Login window show at first");
        loginDialog.showModal();    
    }
    

    snackbarContainer = document.querySelector('#snackbar_recognitionStarted');
    
    snackbarCustomMessageContainer = document.querySelector('#snackbar_customMessage');
    

    loginDialogWithClose = document.getElementById('loginDialogWithClose');
    if (!loginDialogWithClose.showModal) {
        dialogPolyfill.registerDialog(loginDialogWithClose);
    }
    $("#loginDialogWithClose_btnLogin").click(function() {
        console.log("[INFO] UI Login window login request");
        _bl.logIntoServer($("#loginDialogWithClose_txtLoginUsername").val(), $("#loginDialogWithClose_txtLoginPassword").val());
    });
    $('#loginDialogWithClose .close').click(function() {
        console.log("[INFO] UI loginDialogWithClose close");
        loginDialogWithClose.close();
    });


    loginErrorDialog = document.getElementById('loginErrorDialog');
    if (!loginErrorDialog.showModal) {
        dialogPolyfill.registerDialog(loginErrorDialog);
    }
    loginErrorDialog.querySelector('.close').addEventListener('click', function() {
        console.log("[INFO] UI loginErrorDialog close");
        loginErrorDialog.close();
        showLoginDialog();
    });


    loginSuccessDialog = document.getElementById('loginSuccessDialog');
    if (!loginSuccessDialog.showModal) {
      dialogPolyfill.registerDialog(loginSuccessDialog);
    }
    loginSuccessDialog.querySelector('.close').addEventListener('click', function() {
        console.log("[INFO] UI loginSuccessDialog close");
        loginSuccessDialog.close();
    });

    

    
    taskMetadataEditorDialog = document.getElementById('taskMetadataEditorDialog');
    if (!taskMetadataEditorDialog.showModal) {
        dialogPolyfill.registerDialog(taskMetadataEditorDialog);
    }
    taskMetadataEditorDialog.querySelector('.close').addEventListener('click', function() {
        console.log("[INFO] UI taskMetadataEditorDialog close");
        taskMetadataEditorDialog.close();
    });
    taskMetadataEditorDialog.querySelector('#taskMetadataEditorDialog_btnDelete').addEventListener('click', function() {
        console.log("[INFO] UI taskMetadataEditorDialog delete");
        var taskId = $("#taskMetadataEditorDialog_hiddenId").val().trim();
        deleteByTaskId(taskId, function() {
            taskMetadataEditorDialog.close();
        });
    });
    taskMetadataEditorDialog.querySelector('#taskMetadataEditorDialog_btnSave').addEventListener('click', function() {
        console.log("[INFO] UI taskMetadataEditorDialog save");
        var task = {
            id: $("#taskMetadataEditorDialog_hiddenId").val().trim(),
            name: $("#taskMetadataEditorDialog_txtTaskName").val().trim(),
            description: $("#taskMetadataEditorDialog_txtTaskDescription").val().trim(),
            timeout: $("#taskMetadataEditorDialog_txtTimeout").val()
        };
        if ($("#taskMetadataEditorDialog_switchRuntype")[0].checked) {
            task["runtype"] = "ASYNC";
        }
        else {
            task["runtype"] = "SYNC";
        }
        _bl.updateTask(task);
        taskMetadataEditorDialog.close();
    });

    taskMetadataNewTaskDialog = document.getElementById('taskMetadataNewTaskDialog');
    if (!taskMetadataNewTaskDialog.showModal) {
        dialogPolyfill.registerDialog(taskMetadataNewTaskDialog);
    }
    taskMetadataNewTaskDialog.querySelector('.close').addEventListener('click', function() {
        console.log("[INFO] UI taskMetadataNewTaskDialog close");
        taskMetadataNewTaskDialog.close();
    });
    taskMetadataNewTaskDialog.querySelector('#taskMetadataNewTaskDialog_btnCreate').addEventListener('click', function() {
        console.log("[INFO] UI taskMetadataNewTaskDialog create");
        
        var task = {
            name: $("#taskMetadataNewTaskDialog_txtTaskName").val().trim(),
            description: $("#taskMetadataNewTaskDialog_txtTaskDescription").val().trim(),
            timeout: $("#taskMetadataNewTaskDialog_txtTimeout").val()
        };
        if ($("#taskMetadataNewTaskDialog_switchRuntype")[0].checked) {
            task["runtype"] = "ASYNC";
        }
        else {
            task["runtype"] = "SYNC";
        }

        _bl.createTask(task);
        taskMetadataNewTaskDialog.close();
    });
    
    $("#addNewTask").click(function() {
        showTaskMetadataNewTaskDialog();
    });
    $('#tasklist_btnRefresh').click(function() {
        console.log("[INFO] UI tasklist_btnRefresh");    
        _bl.getListTask();
    });
    


    $("#appIcon").click(showloginDialogWithClose);



    $("#queryCard_startWavRecording").click(function() {
        _bl.blStartWavRecording();
    });

    $(".fabStartWavRecording").click(function() {
        _bl.blStartWavRecording();
    });
    

    $("#debug_btnRefresh").click(function() {
        console.log("[INFO] UI debug_btnRefresh click");
        _bl.fetchDebugData();
    });

    $("#debug_btnStartLogging").click(function() {
        console.log("[INFO] UI debug_btnStartLogging click");
        _bl.setDebugMode(true);
    });

    $("#debug_btnStopLogging").click(function() {
        console.log("[INFO] UI debug_btnStopLogging click");
        _bl.setDebugMode(false);
    });

    $("#debug_btnClearLogging").click(function() {
        console.log("[INFO] UI debug_btnClearLogging click");
        _bl.clearDebugLogs();
    });

    $("#devices_btnRefresh").click(function() {
        console.log("[INFO] UI devices_btnRefresh click");
        _bl.getDeviceList();
    });

    
    
    console.log('[INFO] Auto adjust queue data space');
    autoAdjustQueueDataHeight();

    $("#queues_btnFullscreen").click(function() {
        autoAdjustQueueDataHeight();
    });

    $("#queues_btnFlush").click(function() {
        showActionConfirmDialog(function() {
            alert("Hello");
        });
    });

    
    
    console.log('[INFO] Auto adjust article data space');
    autoAdjustWikiDataHeight();

    $("#wiki_btnFullscreen").click(function() {
        autoAdjustWikiDataHeight();
    });


    drawDebugCallstackWidget(
        {
            text: { name: "Debug widget unintialized" },
            children: []
        }
    );

    
    debugRangeSliderEl = document.getElementById('debug_range');
    drawDebugRangeSliderWidget(0, 1, 2, true);


    $("#monaco-editor-btnreset").click(resetMonacoEditorContent);
    $("#monaco-editor-btnsave").click(saveMonacoEditorContent);
    $("#monaco-editor-btnhelp").click(showHelpMonacoEditorContent);
    
    
    wikiNewArticleDialog = document.getElementById('wikiNewArticleDialog');
    if (!wikiNewArticleDialog.showModal) {
        dialogPolyfill.registerDialog(wikiNewArticleDialog);
    }
    wikiNewArticleDialog.querySelector('.close').addEventListener('click', function() {
        console.log("[INFO] UI wikiNewArticleDialog close");
        wikiNewArticleDialog.close();
    });
    wikiNewArticleDialog.querySelector('#wikiNewArticleDialog_btnCreate').addEventListener('click', function() {
        console.log("[INFO] UI wikiNewArticleDialog create");
        
        var articleName = $("#wikiNewArticleDialog_txtArticleName").val().trim()
        
        if (articleName == "") {
            showCustomMessageSnackbar('Please enter a name for article');
            return;
        }
        
        var wikiArticle = {
            name: articleName
        };

        _bl.blCreateWikiArticle(
            wikiArticle,
            function(wikiArticle) {
                showCustomMessageSnackbar('Article created');

                _bl.blOpenArticleByName(
                    wikiArticle["name"],
                    function() {
                        hidePleaseWaitDialog();
                    },
                    function() {
                        hidePleaseWaitDialog();
                        showCustomMessageSnackbar('Failed to open new article');
                    });
            },
            function(wikiArticle) {
                hidePleaseWaitDialog();
                showCustomMessageSnackbar('Failed to create article');
            });
        
        showPleaseWaitDialog();
        wikiNewArticleDialog.close();
    });
    
    $("#wiki_btnAdd").click(function() {
        showWikiNewArticleDialog();
    });
    
    // $("#wiki_btnPlay").click(function() {
    //     // _bl.blStartWavRecording();
    // });
    
    // $("#wiki_btnRefresh").click(function() {
    //     _bl.blWikiRefresh();
    // });
    
    $("#wiki_btnListAll").click(function() {
        _bl.blWikiListAll();
    });
    
    $("#wikiCard_sendUserInput").click(function() {
        queryText = $("#queryToWiki").val();
        _bl.blWikiSearch(queryText);
    });
    
    // Check for Enter keypress
    $("#queryToWiki").keyup(function(event) {
        if (event.which === 13) {
            queryText = $("#queryToWiki").val();
            _bl.blWikiSearch(queryText);
        }
    });
    
    $("#markdown-editor-btnreset").click(resetMarkdownEditorContent);
    $("#markdown-editor-btndelete").click(deleteMarkdownEditorContent);
    $("#markdown-editor-btnsave").click(saveMarkdownEditorContent);
    $("#markdown-editor-btnprev").click(prevMarkdownEditorContent);
    $("#markdown-editor-btnnext").click(nextMarkdownEditorContent);
    
    const zeroPad = (num, places) => String(num).padStart(places, '0');
    $("#markdown-auto-next-slider").on("change mousemove", function() {
        $("#markdown-auto-next-label").html(zeroPad($(this).val(), 2));
    });
    
    setInterval(
        function() {
            var delaySec = 1;
            if (parseInt($("#markdown-auto-next-slider").val()) > 0) {
                var timeout = parseInt($("#markdown-auto-next-label").html());
                if (timeout - delaySec <= 0) {
                    nextMarkdownEditorContent();
                    $("#markdown-auto-next-label").html(zeroPad(
                        parseInt($("#markdown-auto-next-slider").val()),
                        2));
                }
                else {
                    $("#markdown-auto-next-label").html(zeroPad(
                        parseInt($("#markdown-auto-next-label").html()) - delaySec,
                        2));
                }
            }
        },
        1000);
    
    $(window).resize(function() {
        autoAdjustMarkdownEditor();
    });
    
    
    
    /* Very end Presentation */
    var app = getUrlParameter('app');
    if (app == "articles") {
        setInterval(function() {
            appModeArticles();
            hideCurtain();
        }, 1500);
    }
    else {
        setInterval(function() {
            hideCurtain();
        }, 1500);
    }
});
