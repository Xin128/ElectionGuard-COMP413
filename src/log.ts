import {Category,CategoryLogger,CategoryServiceFactory,CategoryConfiguration,LogLevel} from "typescript-logging";

var format = new String("[%(process)d:%(asctime)s]:%(levelname)s:%(message)s");

/*
* A singleton log for the library
*/
class ElectionGuardLog{

    logger:Category;

    constructor() {
        this.logger = new Category("electionguard");
        CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Info)); // change log level here
    }

    getCallInfo():[string, string, string]{
        var getStackTrace = function getStackTrace () {
            var stack;
            stack = new Error().stack || '';
            stack = stack.split('\n').map(function (line) { return line.trim(); });
            stack = stack.slice(stack[0] == 'Error' ? 2 : 1);

            /**
             * let idx:number =0;
             * while (stack[idx].lastIndexOf('at ElectionGuardLog.formattedMessage',0) != 0){
             *      idx += 1;
             * }
             * idx += 2
             */
            let idx:number = 4;

            var funcname:string = stack[idx].split(" ")[1];
            
            var logging:string = stack[idx].substring(stack[idx].indexOf("(")+1, stack[idx].lastIndexOf(")"));
            var lastIdx = logging.lastIndexOf(":");
            var firstIdx = logging.substring(0, lastIdx).lastIndexOf(":");

            var filename = logging.substring(0, firstIdx);
            var line = logging.substring(firstIdx+1, lastIdx);

            return [filename, funcname, line];
        }
        try {
            var res = getStackTrace();
            return [res[0], res[1], res[2]];
        } catch (e) {
            return ["src/ElectionGuardLog", "getCallInfo", "16"];
        }
    }

    formattedMessage(message:string):string{
        var info = this.getCallInfo(); // filename, funcname, line
        return info[0]+"."+info[1]+":L"+info[2]+":"+message;
    }

    info(message:string){
        this.logger.info(() => this.formattedMessage(message));
    }

    debug(message:string){
        this.logger.debug(() => this.formattedMessage(message));
    }

    warn(message:string){
        this.logger.warn(() => this.formattedMessage(message));
    }

    error(message:string){
        this.logger.error(this.formattedMessage(message), null);
    }

    critical(message:string){
        this.logger.fatal(this.formattedMessage(message), null);
    }

}

var LOG = new ElectionGuardLog();

function log_info(message:string){
    LOG.info(message);
}

function log_debug(message:string){
    LOG.debug(message);
}

function log_warning(message:string){
    LOG.warn(message);
}

function log_error(message:string){
    LOG.error(message);
}

function log_critical(message:string){
    LOG.critical(message);
}

log_info("info message here");
log_debug("debug message here");
log_warning("warning message here");
log_error("error message here");
log_critical("critical message here");