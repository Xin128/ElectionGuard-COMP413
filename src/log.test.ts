import { log_info,
     log_debug, log_critical, log_warning,log_error 
   } from './log'


test('the data is peanut butter', () => {
    log_info("info message here");
    log_debug("debug message here");
    log_warning("warning message here");
    log_error("error message here");
    log_critical("critical message here");
    expect(1).toBe(1)
});