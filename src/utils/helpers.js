// Utility functions for time and string formatting

export const millisecondsToStr = (milliseconds) => {
  function numberEnding(number) {
    return (number > 1) ? 's' : ''
  }

  var temp = Math.floor(milliseconds / 1000)
  var years = Math.floor(temp / 31536000)
  if (years) {
    return years + ' year' + numberEnding(years)
  }
  
  var days = Math.floor((temp %= 31536000) / 86400)
  if (days) {
    return days + ' day' + numberEnding(days)
  }
  
  var hours = Math.floor((temp %= 86400) / 3600)
  if (hours) {
    return hours + ' hour' + numberEnding(hours)
  }
  
  var minutes = Math.floor((temp %= 3600) / 60)
  if (minutes) {
    return minutes + ' minute' + numberEnding(minutes)
  }
  
  var seconds = temp % 60
  if (seconds) {
    return seconds + ' second' + numberEnding(seconds)
  }
  
  return 'less than a second'
}

export const checkBrowserCompatibility = () => {
  const errors = []

  if (!document.createElementNS || !document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect) {
    errors.push('Your browser does not have SVG support')
  }

  if (!window.File || !window.FileReader) {
    errors.push('Your browser does not have file upload support')
  }

  if (!window.Worker) {
    errors.push('Your browser does not have web worker support')
  }

  return errors
}