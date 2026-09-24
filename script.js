function setClock()
{
    let clock = document.getElementById("clock");
    let time = new Date()
    let hour = time.getHours();
    let minute = time.getMinutes();

    if(hour < 10)
        {
            hour = "0" + hour
        }
        
        if(minute < 10)
        {
            minute = "0" + minute
        }

    clock.textContent = `${hour}:${minute}`
}

setInterval(setClock, 1000)