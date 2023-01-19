

function DebugUtilClient() {
    DebugUtilClient.prototype.initialize = function() {
        this.startPos = -1;
        this.endPos = -1;
        this.logs = [];
        this.backendToken = null;
    }

    DebugUtilClient.prototype.fetchData = function(token) {
        var self = this;
        console.log("[INFO] DebugUtilClient.prototype.fetchData", token);
        doPost('/v1/debug/rawlogs', 
            { _bl: _bl }, 
            function(data) {
                if (typeof data == 'object' && "token" in data) {
                    console.log("[INFO] DebugUtilClient got a login token");
                    self.backendToken = data["token"];
                    var oldLogs = self.logs;
                    self.logs = data["logs"];
                    
                    if (self.logs == null) self.logs = [];

                    if (self.logs.length == 0) {
                        self.startPos = self.endPos = -1;
                    }
                    else {
                        if (self.startPos == -1 || self.endPos == -1) {
                            self.startPos = 0;
                            self.endPos = self.logs.length - 1;
                        }
                        else {
                            oldStartValue = oldLogs[self.startPos];
                            oldEndValue = oldLogs[self.endPos];

                            newStartValue = self.logs[self.startPos];
                            newEndValue = self.logs[self.endPos];

                            if (oldStartValue == newStartValue && oldEndValue == newEndValue) {
                                // No changes required
                            }
                            else {
                                self.endPos = self.logs.length - 1;
                                self.startPos = Math.max(0, self.endPos - 5);
                            }
                        }
                    }

                    if (self.callbackDataCustom != null) {
                        self.callbackDataCustom(self.backendToken);
                    }
                }
                else {
                    console.log("[INFO] DebugUtilClient no login token found");
                    if (self.callbackDebugDataFailCustom != null) {
                        self.callbackDebugDataFailCustom();
                    }
                }
            });
    }
    DebugUtilClient.prototype.callbackDataCustom = function(token) {
        console.log("[INFO] DebugUtilClient callbackDataCustom got "
                    + "- needs function overriding");
    }
    DebugUtilClient.prototype.callbackDebugDataFailCustom = function() {
        console.log("[INFO] DebugUtilClient callbackDebugDataFailCustom got "
                    + "- needs function overriding");
    }

    DebugUtilClient.prototype.getTotalCount = function() {
        if (this.logs == null) return 0;
        return this.logs.length;
    }

    DebugUtilClient.prototype.setStartPosition = function(pos) {
        console.log("[INFO] DebugUtilCient setStartPosition", pos);
        this.startPos = pos;
    }
    DebugUtilClient.prototype.getStartPosition = function() {
        if (this.startPos == -1) return 0;
        return this.startPos;
    }

    DebugUtilClient.prototype.getEndPosition = function() {
        if (this.endPos == -1) return 0;
        return this.endPos;
    }
    DebugUtilClient.prototype.setEndPosition = function(pos) {
        console.log("[INFO] DebugUtilCient setEndPosition", pos);
        this.endPos = pos;
    }

    DebugUtilClient.prototype.generateChart = function(node, idToNodeList, firstIteration, depthLimit) {
        if (depthLimit <= 0) {
            return null;
        }
        
        var res = {
            text: { 
                name: node["param"]["func"],
                desc: node["status"] + " " + node["param"]["string"],
                contact: {
                    val: node["timestamp"]
                }
            },
            children: []
        };
        
        // Stop recursion
        if (depthLimit == 1) {
            return res;
        }
        
        // Stop on infinite loop - parent_id == id
        if (!firstIteration && node['id'] == node['parent_id']) {
            return res;
        }
        
        if (node["id"] in idToNodeList) {
            var nodeList = idToNodeList[node["id"]];
            for (var i = 0; i < nodeList.length; i++) {
                var nextNode = nodeList[i];

                var nextGraph = this.generateChart(nextNode, idToNodeList, false, depthLimit - 1);
                res.children.push(nextGraph);
            }
        }

        return res;
    }
    DebugUtilClient.prototype.generateTreantGraphData = function(maxRootNodeSupport, maxRecursionDepth) {
        console.log("[INFO] DebugUtilCient generateTreantGraphData startPos, endPos = ", this.startPos, this.endPos);

        var logs = this.logs.slice(this.startPos, this.endPos + 1);
        var parsedLogs = [];
        for (var i = 0; i < logs.length; i++) {
            var log = logs[i];
            parsedLogs.push(JSON.parse(log));
        }
        console.log("\t[INFO] DebugUtilClient.prototype.generateTreantGraphData logs parsed");

        var rootNodesFromLast = [];
        var idToNodeList = {};
        var lastError = '';
        for (var i = parsedLogs.length - 1; i >= 0; i--) {
            var log = parsedLogs[i];
            
            if (lastError == '' && log["metadata"]["error"] != "")
                lastError = "Timestamp: " + log["timestamp"] + "\n" + log["metadata"]["error"];

            var parentId = log["parent_id"];
            var nodeId = log["id"];
            if (parentId == "") {
                rootNodesFromLast.push(log);
            }
            else {
                if (!(parentId in idToNodeList)) {
                    idToNodeList[parentId] = [];
                }
                idToNodeList[parentId].push(log);
            }
        }

        var simple_chart_config = {
            text: { name: "Callstack" },
            children: []
        };

        if (rootNodesFromLast.length > 0) {
            var simple_chart_config = {
                text: { name: "Callstack" },
                children: []
            };

            for (var i = Math.min(maxRootNodeSupport, rootNodesFromLast.length) - 1; i >= 0; i--) {
                var rootNode = rootNodesFromLast[i];
                var chart = this.generateChart(rootNode, idToNodeList, true, maxRecursionDepth);
                console.log("DebugUtilClient.prototype.generateTreantGraphData", rootNode, idToNodeList);
                if (chart != null)
                    simple_chart_config['children'].push(chart);
            }
        }

        return {
            treantGraphData: simple_chart_config,
            lastError: lastError
        };
    }
}

