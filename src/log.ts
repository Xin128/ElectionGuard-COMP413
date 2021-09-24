import {Category,CategoryServiceFactory,CategoryConfiguration,LogLevel} from "typescript-logging";

/*
* A singleton log for the library
*/
class ElectionGuardLog{

    logger:Category;

    constructor() {
        this.logger = new Category("electionguard");
        CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Info)); // change log level
    }

    getCallInfo():[string, string, string]{
        const getStackTrace = function getStackTrace () {
            let stack;
            stack = new Error().stack || '';
            stack = stack.split('\n').map(function (line) { return line.trim(); });
            stack = stack.slice(stack[0] == 'Error' ? 2 : 1);

            const idx = 4;
            const logging:string = stack[idx].substring(stack[idx].indexOf("(")+1, stack[idx].lastIndexOf(")"));
            const lastIdx = logging.lastIndexOf(":");
            const firstIdx = logging.substring(0, lastIdx).lastIndexOf(":");

            // [filename, funcname, line]
            return [logging.substring(0, firstIdx), 
                stack[idx].split(" ")[1], 
                logging.substring(firstIdx+1, lastIdx)];
        }

        try {
            const res = getStackTrace();
            return [res[0], res[1], res[2]];
        } catch (e) {
            return ["src/ElectionGuardLog", "getCallInfo", "16"];
        }
    }

    formattedMessage(message:string):string{
        const info = this.getCallInfo(); // filename, funcname, line
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

const LOG = new ElectionGuardLog();

export const log_info = (message:string): void => LOG.info(message)
export const log_debug = (message:string): void => LOG.debug(message)
export const log_warning = (message:string): void => LOG.warn(message)
export const log_error = (message:string): void => LOG.error(message)
export const log_critical = (message:string): void => LOG.critical(message)