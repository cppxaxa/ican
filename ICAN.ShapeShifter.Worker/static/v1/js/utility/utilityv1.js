
// Reference: https://stackoverflow.com/a/37089656/6484802
var dopostqueue = $({});
function doPostUtil(url, request, callback)
{
    dopostqueue.queue(function()
    {
        processedRequest = JSON.parse(JSON.stringify(request));
        blObject = processedRequest["_bl"];
        processedRequest["token"] = blObject.backendToken;
        delete processedRequest._bl;

        console.log("[INFO] utilityv1 doPost", url, processedRequest);

        $.ajax(
        {   
            type: 'POST',
            url: AppSetting_authenticationServiceUri + url,
            datatype: 'json',
            contentType: "application/json",
            data: JSON.stringify(processedRequest),
            success: function(result) 
            {
                callback(result);
                dopostqueue.dequeue();
            },
            error: function (jqXHR, exception) {
                var msg = '';
                if (jqXHR.status === 0) {
                    msg = 'Not connect.\n Verify Network.';
                } else if (jqXHR.status == 404) {
                    msg = 'Requested page not found. [404]';
                } else if (jqXHR.status == 500) {
                    msg = 'Internal Server Error [500].';
                } else if (exception === 'parsererror') {
                    msg = 'Requested JSON parse failed.';
                } else if (exception === 'timeout') {
                    msg = 'Time out error.';
                } else if (exception === 'abort') {
                    msg = 'Ajax request aborted.';
                } else {
                    msg = 'Uncaught Error.\n' + jqXHR.responseText;
                }
                console.log("### " + msg);
            }
        })
    });
}

function transcribeWavBlob(backendToken, transcriptionUrl, blob, callback = null)
{
    console.log("[INFO] utilityv1 transcribeWavBlob");

    var filename = new Date().toISOString();
    var xhr=new XMLHttpRequest();
    xhr.onload=function(e) {
        if(this.readyState === 4) {
            console.log("\t[INFO] utilityv1 Server returned: ", e.target.responseText);
            callback(e.target.responseText);
        }
    };
    var fd=new FormData();
    fd.append("token", backendToken);
    fd.append("file",blob, filename);
    fd.append("beam", false);
    xhr.open("POST",transcriptionUrl,true);
    xhr.send(fd);
}

function doTranscribeWavBlobUtil(backendToken, transcriptionUrl, blob, callback = null)
{
    console.log("[INFO] utilityv1 doTranscribeWavBlob");

    dopostqueue.queue(function()
    {
        var filename = new Date().toISOString();
        var xhr=new XMLHttpRequest();
        xhr.onload=function(e) {
            if(this.readyState === 4) {
                console.log("\t[INFO] utilityv1 doTranscribeWavBlob Server returned: ", e.target.responseText);
                callback(e.target.responseText);
                dopostqueue.dequeue();
            }
            else
            {
                console.log("\t[INFO] utilityv1 doTranscribeWavBlob Server call readyState != 4", this.readyState);
            }
        };
        var fd=new FormData();
        fd.append("token", backendToken);
        fd.append("file",blob, filename);
        fd.append("beam", false);
        xhr.open("POST",transcriptionUrl,true);
        xhr.send(fd);
    });
}








// --------------------------------
// Synchronize feature
// --------------------------------

function synchronize() {

    const workQueue = [];
    const context = {
        locked: false
    };

    /**
     * Release the lock and start new work if the queue contains work.
     */
    function releaseFn() {
        context.locked = false;
        if (workQueue.length) {
            startWork(workQueue.shift());
        }
    }

    /**
     * Start or queue new work.
     *
     * @param {Function} fn The function to start or queue
     */
    function startWork(fn) {

        // Currently there's a lock active, queue the new function.
        if (context.locked) {
            workQueue.push(fn);
            return;
        }
        context.locked = true;
        setTimeout(() => {
            fn(releaseFn);
        }, 0);
    }

    return startWork
}

const synchronized = synchronize();


function doPostPromise(url, request, callback, data) {
    const promise = new Promise(resolve => {
        synchronized(release => {
            promise.finally(release);

            processedRequest = JSON.parse(JSON.stringify(request));
            blObject = processedRequest["_bl"];
            processedRequest["token"] = blObject.backendToken;
            delete processedRequest._bl;

            console.log("[INFO] utilityv1 doPost", url, processedRequest);

            $.ajax(
            {   
                type: 'POST',
                url: AppSetting_authenticationServiceUri + url,
                datatype: 'json',
                contentType: "application/json",
                data: JSON.stringify(processedRequest),
                success: function(result) 
                {
                    callback(result);

                    data.counter++;
                    console.log('Counter: ' + data.counter);
                    resolve(data.counter);
                },
                error: function (jqXHR, exception) {
                    var msg = '';
                    if (jqXHR.status === 0) {
                        msg = 'Not connect.\n Verify Network.';
                    } else if (jqXHR.status == 404) {
                        msg = 'Requested page not found. [404]';
                    } else if (jqXHR.status == 500) {
                        msg = 'Internal Server Error [500].';
                    } else if (exception === 'parsererror') {
                        msg = 'Requested JSON parse failed.';
                    } else if (exception === 'timeout') {
                        msg = 'Time out error.';
                    } else if (exception === 'abort') {
                        msg = 'Ajax request aborted.';
                    } else {
                        msg = 'Uncaught Error.\n' + jqXHR.responseText;
                    }
                    console.log("### " + msg);

                    data.counter++;
                    console.log('Counter: ' + data.counter);
                    resolve(data.counter);
                }
            });
        });
    });
    return promise;
}

function doTranscribeWavBlobPromise(backendToken, transcriptionUrl, blob, callback, data)
{
    const promise = new Promise(resolve => {
        synchronized(release => {
            promise.finally(release);

            console.log("[INFO] utilityv1 doTranscribeWavBlob");

            var filename = new Date().toISOString();
            var xhr = new XMLHttpRequest();
            xhr.onload = function(e) {
                if(this.readyState === 4) {
                    console.log("\t[INFO] utilityv1 doTranscribeWavBlob Server returned: ", e.target.responseText);
                    callback(e.target.responseText);
                    
                    data.counter++;
                    console.log('Counter: ' + data.counter);
                    resolve(data.counter);
                }
                else {
                    console.log("\t[INFO] utilityv1 doTranscribeWavBlob Server call readyState != 4", this.readyState);
                    
                    data.counter++;
                    console.log('Counter: ' + data.counter);
                    resolve(data.counter);
                }
            };
            var fd = new FormData();
            fd.append("token", backendToken);
            fd.append("file",blob, filename);
            fd.append("beam", false);
            xhr.open("POST",transcriptionUrl,true);
            xhr.send(fd);
        });
    });
    return promise;
}

const data = {
    counter: 0
}

function doPost(url, request, callback)
{
    doPostPromise(url, request, callback, data)
    .then(result => {
        console.log(`doPostPromise success, result: ${result}`);
    });
}

function doTranscribeWavBlob(backendToken, transcriptionUrl, blob, callback = null)
{
    doTranscribeWavBlobPromise(backendToken, transcriptionUrl, blob, callback, data)
    .then(result => {
        console.log(`doTranscribeWavBlobPromise success, result: ${result}`);
    });
}

/**
 * Some heavy calculations in a promise.
 *
 * @param {number} executionSequence The index number of execution
 * @param {{counter:number}} data Wrapper object with counter
 * @return {Promise<number>} Promise that resolves on success or rejects otherwise
 */
function execute(executionSequence, data) {
    const promise = new Promise(resolve => {
        synchronized(release => {
            // Release the lock when the promise is done.
            promise.finally(release);

            // Wait a random time between 0 and 2 seconds.
            setTimeout(() => {
                for (var i = 0; i < 10; i++)
                {
                    data.counter++;
                    console.log('Execute promise: ' + executionSequence);
                    console.log('Counter: ' + data.counter);
                    resolve(data.counter);
                }
            }, Math.random() * 2 * 1000);
        });
    });
    return promise;
}

function main() {
    for (let i = 1; i <= 10; i++) {
        console.log(`==== Create promise: ${i}`);
        execute(i, data)
        .then(result => {
            console.log(`Promise success: ${i}, result: ${result}`);
        });
    }
}

// main()