const express = require('express')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')
const stripe = require('stripe')('sk_test_51MHLVESArcYCAO09UHVj98fXX7kF7Ipq9veKqOmH60lAD4fQWoGrczMhD2ktHwacNf83pbdKl4YeNT04NgiYOSVj00Ho6KGqU2')

const app = express();

const port = process.env.PORT || 8080

app.use(cors());

app.use(express.json())

app.get('/', (req, res) => {
    res.send('Welcome to our Ecommerce Store')
})

app.post('/checkout', async (req, res) => {
    let error;
    let status;
    try {
        const { cart, token } = req.body;
        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id
        })
        const key = uuidv4();
        const charge = await stripe.paymentIntents.create({
            amount: cart.totalPrice * 100,
            currency: 'usd',
            payment_method_types: ['card'],
            customer: customer.id,
            receipt_email: token.email,
            description: 'product description here',
            shipping: {
                name: token.card.name,
                address: {
                    line1: token.card.address_line1,
                    line2: token.card.address_line2,
                    city: token.card.address_city,
                    country: token.card.address_country,
                    postal_code: token.card.address_zip
                }
            }
        }, { idempotencyKey: key })
        console.log(charge)
        status = "success"
    } catch (error) {
        console.log(error)
        status = "error"
    }
    res.json({ status })
})

app.listen(port, () => {
    console.log(`Your app is running at http://localhost:${port}`)
})