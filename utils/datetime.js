class DateTimeString {
    constructor() {
        this.currentDate = new Date();
    }

    getYear() {
        return this.currentDate.getFullYear();
    }

    getMonth() {
        return String(this.currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed; add 1 to get correct month number
    }

    getDay() {
        return String(this.currentDate.getDate()).padStart(2, '0');
    }

    getHours() {
        return String(this.currentDate.getHours()).padStart(2, '0');
    }

    getMinutes() {
        return String(this.currentDate.getMinutes()).padStart(2, '0');
    }

    getSeconds() {
        return String(this.currentDate.getSeconds()).padStart(2, '0');
    }

    getDateTimeString() {
        return `${this.getMonth()}-${this.getDay()}-${this.getHours()}:${this.getMinutes()}:${this.getSeconds()}`;
    }
}

module.exports = DateTimeString;