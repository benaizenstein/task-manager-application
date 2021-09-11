const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const sendWelcomeEmail = (email,name)=>{

    sgMail.send({
        to:email,
        from:"ben.aizenstein@gmail.com",
        subject:'thanks for joining in!',
        text:`welcome ${name}!`
    })
    console.log('email has been send')
}
const sendCancellationEmail = (email,name)=>{

    sgMail.send({
        to:email,
        from:"ben.aizenstein@gmail.com",
        subject:'Cancellation!',
        text:`${name} has been removed!`
    })
    console.log('user has been removed')
}
module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}


