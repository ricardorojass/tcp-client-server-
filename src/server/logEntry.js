module.exports = async function LogEntry(message) {
    const messageParts = message.split('\n');
    if (messageParts.length != 3) throw new Error('Invalid message format')
    if (!messageParts[1].toUpperCase().trim().includes('MACHINE:')) throw new Error('Invalid message format');
    const machineParts = messageParts[1].split(':');
    if (machineParts.length != 2) throw new Error('Invalid message format');

    const machine = machineParts[1].trim().toUpperCase();
    if (!messageParts[2].toUpperCase().trim().includes('DATA:')) throw new Error('Invalid message format');

    const data = messageParts[2].substring(6);
    const when = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    return {
        machine: machine,
        data: data,
        when: when
    };


    // toString() {
    //     return `when: ${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}, machine: ${this.machine}, data: ${this.data}`;
    // }
};