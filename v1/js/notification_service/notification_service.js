
function NotificationService() {
    NotificationService.prototype.initialize = function() {
        this.channelMap = {};
        this.deviceChannelSubscribed = {};
        this.fetchCount = {};
        this.inProgress = {};
        this.lastDataFetched = {};
        this.callbackFnMap = {};
    }

    NotificationService.prototype.isSubscribed = function(deviceId) {
        if (!(deviceId in this.deviceChannelSubscribed)) {
            return false;
        }
        return this.deviceChannelSubscribed[deviceId];
    }

    NotificationService.prototype.subscribe = function(_bl, deviceId, callbackFn, failureCallbackFn) {
        var self = this;
        if (!this.isSubscribed(deviceId)) {
            this.deviceChannelSubscribed[deviceId] = true;
            this.inProgress[deviceId] = false;
            this.fetchCount[deviceId] = 0;
            this.lastDataFetched[deviceId] = Math.floor(Date.now() / 1000) - AppSetting_minIntervalBetweenNotificationFetch - 1;
            this.callbackFnMap[deviceId] = callbackFn;
            this.channelMap[deviceId] = setInterval(function() {
                if (self.inProgress[deviceId])
                    return;
                if (Math.floor(Date.now() / 1000) - self.lastDataFetched[deviceId] < AppSetting_minIntervalBetweenNotificationFetch)
                    return;
                self.inProgress[deviceId] = true;
                self.fetchCount[deviceId]++;
                var self2 = self;
                self.getMessageList(_bl, deviceId, AppSetting_notificationBatchSize, function(response) {
                    console.log("\t[INFO] notification fetch " + deviceId + " timeout:" + self2.fetchCount[deviceId]);
                    if (self2.callbackFnMap[deviceId] != null) {
                        self2.callbackFnMap[deviceId](response);
                    }
                    self2.lastDataFetched[deviceId] = Math.floor(Date.now() / 1000);
                    self2.inProgress[deviceId] = false;
                }, function() {
                    clearInterval(self.channelMap[deviceId]);
                    self2.deviceChannelSubscribed[deviceId] = false;
                    self2.inProgress[deviceId] = false;
                    failureCallbackFn();
                });
            }, Math.floor(AppSetting_minIntervalBetweenNotificationFetch / 2));
        }
    }

    NotificationService.prototype.getMessageList = function(_bl, deviceId, limit, callback, failureCallback) {
        var self = this;
        doPost('/v1/notification/get/{device}/limit/{limit}'
                    .replace('{device}', deviceId)
                    .replace('{limit}', limit),
            { _bl: _bl },
            function(data) {
                if (typeof data == 'object' && "token" in data) {
                    console.log("[INFO] NotificationService got a login token, passing to callback");
                    callback(data);
                }
                else {
                    console.log("[INFO] NotificationService no login token found");
                    failureCallback();
                }
            });
    }
}
