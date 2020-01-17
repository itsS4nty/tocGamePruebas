exports.showTouchKeyboard = function (exec) {
    exec('start /d "C:\\Program Files\\Common Files\\microsoft shared\\ink" TabTip.exe', (error, stdout, stderr) => {
        if (error) {
            console.error(error);
            return;
        }
    });
}