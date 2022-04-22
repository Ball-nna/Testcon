require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const User = require('./model/user')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { dirname } = require('path')
const JWT_SECRET = 'ThisisTokenToGen'
const jsonParser = bodyParser()
const app = express()
app.use(cors())
app.use(bodyParser.json())
//Connnect Db
mongoose.connect(process.env.DATABASE_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true
})
//Connect Frontend
app.use(express.static(__dirname+'/build'))
//For check authen
app.post('/authen',jsonParser,(req,res,next)=>{
	try{
		const token = req.headers.authorization.split(' ')[1]
		const decoded = jwt.verify(token, JWT_SECRET);
		res.json({status:"ok",decoded})
	}catch(err){
		res.json({ status:"error",msg:err.msg})
	}
})
//Fir checj register form
app.post('/register', async (req, res) => {
	const { username, password: plainTextPassword } = req.body
	if (!username || typeof username !== 'string') {
		return res.json({ status: 'error', error: 'Invalid username' })
	}
	if (!plainTextPassword || typeof plainTextPassword !== 'string') {
		return res.json({ status: 'error', error: 'Invalid password' })
	}
	if (plainTextPassword.length < 5) {
		return res.json({
			status: 'error',
			error: 'Password too small. Should be atleast 6 characters'
		})
	}
	const password = await bcrypt.hash(plainTextPassword, 10)
	try {
		const response = await User.create({
			username,
			password
		})
		console.log('User created successfully: ', response)
	} catch (error) {
		if (error.code === 11000) {
			
			return res.json({ status: 'error', error: 'Username already in use' })
		}
		throw error
	}

	res.json({ status: 'ok' })
})
//For check Login
app.post('/login', async (req, res) => {
	const { username, password } = req.body
	const user = await User.findOne({ username }).lean()

	if (!user) {
		return res.json({ status: 'error', error: 'Invalid username/password' })
	}

	if (await bcrypt.compare(password, user.password)) {

		const token = jwt.sign(
			{
				id: user._id,
				username: user.username
			},JWT_SECRET
			
		)

		return res.json({ status: 'ok', token :token })
	}

	res.json({ status: 'error', error: 'Invalid username/password' })
})

app.listen(5000,()=>{
    console.log("Connected")
})