/**
 * @file 获取代理相关的信息
 * @author zdying
 */

var parseHosts = require('./parseHosts');
var parseRewrite = require('./parseRewrite');

var url = require('url');
var fs = require('fs');

var commands = require('./commands');

var hostRules = null;
var rewriteRules = null;

// fs.watchFile(__dirname + '/hosts', function(){
//     _parseHosts()
// });
//
// fs.watchFile(__dirname + '/hosts', function(){
//     _parseHosts()
// });

module.exports = function getProxyInfo(request, hostsPath, rewritePath){
    if(!hostRules){
        hostRules = parseHosts(hostsPath);
    }

    if(!rewriteRules){
        rewriteRules = parseRewrite(rewritePath)
    }

    log.debug('getProxyInfo - hostRules', JSON.stringify(hostRules));
    log.debug('getProxyInfo - rewriteRules', JSON.stringify(rewriteRules));

    var uri = url.parse(request.url);
    var rewrite = getRewriteRule(uri);
    var host = hostRules[uri.hostname];

    var hostname, port, path, proxyName;

    if(rewrite){
        var proxy = rewrite.proxy[0];
        var reg = /^(\w+:\/\/)/;
        var newUrl, newUrlObj;
        var context = {
            request: request
        };

        // 如果代理地址中包含具体协议，删除原本url中的协议
        // 最终替换位代理地址的协议
        if(proxy.match(reg)){
            request.url = request.url.replace(reg, '')
        }

        // 将原本url中的部分替换为代理地址
        newUrl = request.url.replace(rewrite.source, proxy);
        newUrlObj = url.parse(newUrl);

        if(Array.isArray(rewrite.funcs)){
            rewrite.funcs.forEach(function(obj){
                // 以`proxy`开头的指令是proxy request指令
                if(obj.func.match(/^proxy/)){
                    commands[obj.func].apply(context, obj.params)
                }
            })
        }

        hostname = newUrlObj.hostname;
        port = newUrlObj.port || 80;
        path = newUrlObj.path;
        proxyName = 'HIIPACK_PROXY';
    }else if(host){
        hostname = host.split(':')[0];
        port = Number(host.split(':')[1]);
        path = uri.path;
        proxyName = 'HIIPACK_PROXY';
    }else{
        hostname = uri.hostname;
        port = uri.port || 80;
        path = uri.path;
    }

    request.headers.host = uri.host;

    return {
        proxy_options: {
            host: hostname,
            port: port || 80,
            path: path,
            method: request.method,
            headers: request.headers
        },
        HIIPACK_PROXY: proxyName,
        hosts_rule: host,
        rewrite_rule: rewrite
    }
};

function getRewriteRule(urlObj){
    var host = urlObj.hostname;
    var path = urlObj.path;
    var pathArr = path.split('/');
    var len = pathArr.length;
    var rewriteRule = null;
    var tryPath = '';

    while(len--){
        tryPath = host + pathArr.slice(0, len + 1).join('/');

        if((tryPath in rewriteRules) || ((tryPath += '/') in rewriteRules)){
            rewriteRule = rewriteRules[tryPath];
            break;
        }
    }

    log.debug('getProxyInfo -', host + path, JSON.stringify(rewriteRule));

    return rewriteRule
}