const ics = require('ics');

exports.generateICS = (webinar) => {
  const event = {
    start: [
      webinar.date.getFullYear(),
      webinar.date.getMonth() + 1,
      webinar.date.getDate(),
      webinar.date.getHours(),
      webinar.date.getMinutes()
    ],
    duration: { minutes: parseInt(webinar.duration) },
    title: webinar.titulo,
    description: webinar.descripcion,
    location: webinar.meetingUrl,
    url: webinar.meetingUrl,
    status: 'CONFIRMED',
    busyStatus: 'BUSY'
  };

  let icsString = '';
  ics.createEvent(event, (error, value) => {
    if (error) {
      console.error(error);
      return null;
    }
    icsString = value;
  });

  return icsString;
}; 