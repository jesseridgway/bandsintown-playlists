const addDays = (dateObj, numDays) => {
    dateObj.setDate(dateObj.getDate() + numDays);
    return dateObj;
}

const formatDate = (dateObj) => {
    return dateObj.toISOString().slice(0, 19)
}

const getStartAndEndTime = () => {
    let today = formatDate(new Date())
    let nextWeek = formatDate(addDays(new Date(), 7))
    
    return {startsAt: today, endsAt: nextWeek}
}


// console.log(getStartAndEndTime())
module.exports = { getStartAndEndTime}