/**
 * @file
 * @author zdying
 */

var colors = require('colors');

module.exports = {
    namespace: function(name){
        var log = Object.create(this);
        log._namespace = name;
        return log;
    },
    debug: function(){
        program.debug && this.printMessage('debug', 'magenta', arguments)
    },
    access: function(req, proxy){
        var statusCode = req.res.statusCode;
        var colormap = {
            404: 'yellow',
            500: 'red',
            304: 'green',
            200: 'white'
        };
        var time = Date.now() - req._startTime;

        this.printMessage('access', 'green', true, [
            req.method.white,
            (req.originalUrl || req.url).grey,
            proxy ? ('==> '.bold.white + proxy.grey) : '',
            String(statusCode)[colormap[statusCode] || 'grey'],
            ('(' + time + 'ms' + ')')[time >= 2000 ? 'yellow' : 'grey']
        ])
    },
    error: function(err){
        var type = Object.prototype.toString.call(err);

        if(type === '[object Error]'){
            this.printMessage('error', 'red', err.message);
            if(program.detail){
                this.printMessage('', 'red', true, err.stack)
            }
        }else{
            this.printMessage('error', 'red', arguments)
        }
    },
    warn: function(){
        this.printMessage('warn', 'yellow', arguments)
    },
    info: function(){
        this.printMessage('info', 'magenta', arguments)
    },
    detail: function(){
        program.detail && this.printMessage('detail', 'green', arguments)
    },
    printMessage: function(group, groupColor, ignoreNamespace, message){
        var timeStr = '';
        if(arguments.length === 3){
            message = ignoreNamespace;
            ignoreNamespace = false;
        }
        if(typeof message === 'object'){
            message = Array.prototype.join.call(message, ' ')
        }

        if(this._namespace && !ignoreNamespace){
            message = this._namespace + ' - ' + message
        }

        if(program.logTime){
            timeStr = '[' + new Date().toLocaleTimeString() + '] ';
        }

        console.log(timeStr + (group ? ('[' + group + '] ').bold[groupColor] : '') + message);
    }
};