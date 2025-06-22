const fs = require('fs');

const jobs = {};

const analyseLogs = () => {
    // We are reading the log file and splitting each row into an array  
    const logFile = fs.readFileSync('./logs.log', 'utf8');
    const rows = logFile.split('\n');

    for (const row of rows) {
        // Looping through each row, splitting the cells by comma in order to get the value for time, status and pid
        const rowContent = row.split(',');
        const [time, _, status, pid] = rowContent;
        const loggedStatus = status.trim() === 'START' ? 'startTime': 'endTime';

        // Then, we assign to our jobs object a key for each PID we get, saving the startTime and endTime
        if (jobs[pid]) jobs[pid][loggedStatus] = time;
        else jobs[pid] = {[loggedStatus]: time};
    };

    for (const job in jobs) {
        // We loop through each key in the jobs object
        // If for each job we find both startTime and endTime we calculate the duration and compute if the
        // job should have an erorr or warning and log a message if that's the case
        const { startTime, endTime } = jobs[job];

        if (startTime && endTime) {
            const duration = getDuration(startTime, endTime);
            const status = getStatusFromDuration(duration);
            jobs[job]["status"] = status

            if (["Error", "Warning"].includes(status)) console.log(`Job with id ${job} has an ${status.toLowerCase()}`)
        } else {
            jobs[job]["status"] = "TBD";
        };
    };
};

const getDuration = (startTime, endTime) => {
    // We get the timestamps for both start and end times, using an arbitrary day and return the difference
    const start = Date.parse(`1970-01-01T${startTime}Z`);
    const end = Date.parse(`1970-01-01T${endTime}Z`);

    return Math.floor((end - start) / 1000);
};

const getStatusFromDuration = duration => {
    if (duration > 600) return "Error";
    if (duration > 300) return "Warning";
    return 'Success';
};

analyseLogs();

module.exports = { analyseLogs };