const express = require( 'express' );
const cors = require( 'cors' );
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const config = require( './config' );
const axios = require( 'axios' );

const wordPressRestUrl = `${config.wordPressUrl}${config.wordPressRestNameSpace}`;

const app = express();
app.use( cors() );

// Parse application/x-www-form-urlencoded
app.use( bodyParser.urlencoded( { extended: false } ) );

// Parse application/json
app.use(bodyParser.json());

/**
 * Sign in user
 *
 * @route http://localhost:5000/sign-in
 */
app.post( '/sign-in', ( req, res ) => {

	jwt.sign( req.body ,config.tokenSecret , { expiresIn: 3600 }, ( err, token ) => {
		if ( ! token ) {
			res.json({ success: false, error: 'Token could not be generated' });
		} else {

			// Make a login request.
			axios.post( `${wordPressRestUrl}/user/login`, req.body )
				.then( response => {

					res.json( {
						success: true,
						status: 200,
						token,
						userData: response.data.user.data
					} );
				} )
				.catch( err => {
					const responseReceived = err.response.data;
					res.status(404).json({ success: false, status: 400, errorMessage: responseReceived.message });
				} );
		}

	} );
} );

/**
 * Create a new post
 *
 * @route http://localhost:5000/create-post
 */
app.post( '/create-post', ( req, res ) => {

	jwt.verify(req.body.token, config.tokenSecret, function ( err, decoded ) {
	if ( undefined !== decoded ) {

		const postData = {
			user_id: req.body.userID,
			title: req.body.title,
			content: req.body.content,
		};

		// Make a create post request.
		axios.post( `${wordPressRestUrl}/post/create`, postData )
			.then( response => {

				res.json( {
					success: true,
					status: 200,
					userData: response.data
				} );
			} )
			.catch( err => {
				const responseReceived = err.response.data;
				res.status(404).json({ success: false, status: 400, errorMessage: responseReceived.message });
			} );
	} else {
		res.status( 400 ).json( { success: false, status: 400, errorMessage: 'Authorization failed'} );
	}
});
} );

app.listen( 5000, () => console.log( 'Listening on port 5000' ) );