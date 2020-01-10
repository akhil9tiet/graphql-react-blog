import React, { Component } from 'react';

export default class FetchRandomUser extends Component {
	state = {
		loading: true,
		person: null
	};

	async componentDidMount() {
		const url = 'http://api.randomuser.me/';
		const response = await fetch(url, { mode: 'no-cors' });
		const data = await response.json();
		console.log('data', data);
		this.setState({ loading: false, person: data.result[0] });
	}

	render() {
		return (
			<div>
				{this.state.loading || !this.state.person ? (
					<div>loading...</div>
				) : (
					<div>
						<h1>{this.state.person.name.title}</h1>
						<h1>{this.state.person.name.first}</h1>
						<h1>{this.state.person.name.last}</h1>
						<img src={this.state.person.picture.large} alt={'USER'} />
					</div>
				)}
			</div>
		);
	}
}
