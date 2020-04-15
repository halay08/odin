export const SendGridEventTypes = (event: string):any =>{
    switch(event){
        case 'processed':
            return{
                color : 'gold',
                description : 'Message has been received and is ready to be delivered.'
            }
        case 'dropped':
            return{
                color: 'red',
                description: 'You may see the following drop reasons: Invalid SMTP API header, Spam Content, Unsubscribed Address etc.'
            }
        case 'delivered':
            return {
                color: 'green',
                description: 'Message has been successfully delivered to the receiving server.'
            }
        case 'deferred':
            return {
                color: 'red',
                description: 'Receiving server temporarily rejected the message.'
            }
        case 'bounce':
            return {
                color: 'red',
                description: 'Receiving server could not or would not accept mail to this recipient permanently.'
            }
        case 'blocked':
            return {
                color: 'red',
                description: 'Receiving server could not or would not accept the message temporarily.'
            }
        case 'open':
            return {
                color: 'green',
                description: 'Recipient has opened the HTML message. Open Tracking needs to be enabled for this type of event.'
            }
        case 'click':
            return {
                color: 'green',
                description: 'Recipient clicked on a link within the message. Click Tracking needs to be enabled for this type of event.'
            }
        case 'spamreport':
            return {
                color: 'red',
                description: 'Recipient marked message as spam.'
            }
        case 'unsubscribe':
            return {
                color: 'orange',
                description: 'Recipient clicked on the Opt Out of All Emails link.'
            }
       case 'group_unsubscribe':
           return {
                color: 'orange',
                description: 'Recipient unsubscribed from a specific group either by clicking the link directly or updating their preferences.'
            }
        case 'group_resubscribe':
            return {
                color: 'green',
                description: 'Recipient resubscribed to a specific group by updating their preferences.'
            }
        default:
            return{
                color: 'grey',
                description: 'No available description'
            }
    }
};