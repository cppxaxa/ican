

function QueueDataClient() {
    QueueDataClient.prototype.initialize = function(limit = 10) {
        this.device = "";
        this.stateExpand = false;
        this.limit = limit;
    }

    QueueDataClient.prototype.openDevice = function(device) {
        this.device = "";
        this.stateExpand = false;
        this.fetchPreviewData();
    }

    QueueDataClient.prototype.expand = function() {
        var lastStateExpand = this.stateExpand;
        this.stateExpand = true;

        if (lastStateExpand != this.stateExpand)
            this.fetchAuto();
    }

    QueueDataClient.prototype.isStateExpand = function() {
        return this.stateExpand;
    }

    QueueDataClient.prototype.getDeviceListCallbackDataCustom = function(token, devices) {
        console.log("[INFO] QueueDataClient getDeviceListCallbackDataCustom got "
                    + "- needs function overriding");
    }
    QueueDataClient.prototype.getDeviceListCallbackDataFailCustom = function() {
        console.log("[INFO] QueueDataClient getDeviceListCallbackDataFailCustom got "
                    + "- needs function overriding");
    }
    QueueDataClient.prototype.getDeviceList = function() {
        var self = this;
        console.log("[INFO] QueueDataClient.prototype.getDeviceList");
        doPost('/v1/devices/filter/type/NotificationDevice', 
            { _bl: _bl }, 
            function(data) {
                if (typeof data == 'object' && "token" in data) {
                    console.log("[INFO] QueueDataClient got a login token");

                    if (self.getDeviceListCallbackDataCustom != null) {
                        self.getDeviceListCallbackDataCustom(data["token"], data["devices"]);
                    }
                }
                else {
                    console.log("[INFO] QueueDataClient no login token found");
                    if (self.getDeviceListCallbackDataFailCustom != null) {
                        self.getDeviceListCallbackDataFailCustom();
                    }
                }
            });
    }

    QueueDataClient.prototype.callbackDataCustom = function(token, messagelist) {
        console.log("[INFO] QueueDataClient callbackDataCustom got "
                    + "- needs function overriding");
    }
    QueueDataClient.prototype.callbackDataFailCustom = function() {
        console.log("[INFO] QueueDataClient callbackDataFailCustom got "
                    + "- needs function overriding");
    }
    QueueDataClient.prototype.fetchAuto = function() {
        if (this.stateExpand)
            this.fetchData();
        else
            this.fetchPreviewData();
    }
    QueueDataClient.prototype.fetchPreviewData = function() {
        var self = this;
        console.log("[INFO] QueueDataClient.prototype.fetchPreviewData");
        doPost('/v1/notification/peek/' + this.device + "/limit/" + this.limit, 
            { _bl: _bl }, 
            function(data) {
                if (typeof data == 'object' && "token" in data) {
                    console.log("[INFO] QueueDataClient got a login token");

                    if (self.callbackDataCustom != null) {
                        self.callbackDataCustom(data["token"], data["messagelist"]);
                    }
                }
                else {
                    console.log("[INFO] QueueDataClient no login token found");
                    if (self.callbackDataFailCustom != null) {
                        self.callbackDataFailCustom();
                    }
                }
            });
    }
    QueueDataClient.prototype.fetchData = function() {
        var self = this;
        console.log("[INFO] QueueDataClient.prototype.fetchData");
        doPost('/v1/notification/peek/' + this.device, 
            { _bl: _bl }, 
            function(data) {
                if (typeof data == 'object' && "token" in data) {
                    console.log("[INFO] QueueDataClient got a login token");

                    if (self.callbackDataCustom != null) {
                        self.callbackDataCustom(data["token"], data["messagelist"]);
                    }
                }
                else {
                    console.log("[INFO] QueueDataClient no login token found");
                    if (self.callbackDataFailCustom != null) {
                        self.callbackDataFailCustom();
                    }
                }
            });
    }

    
    QueueDataClient.prototype.callbackFlushDataCustom = function(token) {
        console.log("[INFO] QueueDataClient callbackFlushDataCustom got "
                    + "- needs function overriding");
    }
    QueueDataClient.prototype.callbackFlushDataFailCustom = function() {
        console.log("[INFO] QueueDataClient callbackFlushDataFailCustom got "
                    + "- needs function overriding");
    }
    QueueDataClient.prototype.flushAuto = function() {
        if (this.stateExpand)
            this.flushData();
        else
            this.flushPreviewData();
    }
    QueueDataClient.prototype.flushPreviewData = function() {
        console.log("[INFO] QueueDataClient.prototype.flushPreviewData");
        this.flushDataByCount(this.limit);
    }
    QueueDataClient.prototype.flushData = function() {
        var self = this;
        console.log("[INFO] QueueDataClient.prototype.flushData");
        doPost('/v1/notification/get/' + this.device, 
            { _bl: _bl }, 
            function(data) {
                if (typeof data == 'object' && "token" in data) {
                    console.log("[INFO] QueueDataClient got a login token");

                    if (self.callbackFlushDataCustom != null) {
                        self.callbackFlushDataCustom(data["token"]);
                    }
                }
                else {
                    console.log("[INFO] QueueDataClient no login token found");
                    if (self.callbackFlushDataFailCustom != null) {
                        self.callbackFlushDataFailCustom();
                    }
                }
            });
    }
    QueueDataClient.prototype.flushDataByCount = function(count) {
        var self = this;
        console.log("[INFO] QueueDataClient.prototype.flushDataByCount");
        doPost('/v1/notification/get/' + this.device + "/limit/" + count, 
            { _bl: _bl }, 
            function(data) {
                if (typeof data == 'object' && "token" in data) {
                    console.log("[INFO] QueueDataClient got a login token");

                    if (self.callbackFlushDataCustom != null) {
                        self.callbackFlushDataCustom(data["token"]);
                    }
                }
                else {
                    console.log("[INFO] QueueDataClient no login token found");
                    if (self.callbackFlushDataFailCustom != null) {
                        self.callbackFlushDataFailCustom();
                    }
                }
            });
    }
}

