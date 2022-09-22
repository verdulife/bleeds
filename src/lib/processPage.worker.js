onmessage = ({ data, msg }) => {
	console.log(msg, data);

	const message = {
		msg: 'response1',
		data: { text: 'Cool it works out v2 🥳' }
	};
	postMessage(message);
};
