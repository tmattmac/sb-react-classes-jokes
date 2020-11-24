import React, { useState, useEffect } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

class JokeList extends React.Component {

  static defaultProps = { numJokesToGet: 10 };

  constructor(props) {
    super(props);
    this.state = { jokes: [] };
    this.generateNewJokes = this.generateNewJokes.bind(this);
    this.vote = this.vote.bind(this);
    this.toggleLock = this.toggleLock.bind(this);
  }

  async getJokes() {
    let j = [...this.state.jokes];
    let seenJokes = new Set();
    try {
      
      while (j.length < this.props.numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" }
        });
        let { status, ...jokeObj } = res.data;
        
        if (!seenJokes.has(jokeObj.id)) {
          seenJokes.add(jokeObj.id);
          j.push({ ...jokeObj, votes: 0, locked: false });
        } else {
          console.error("duplicate found!");
        }
      }
      this.setState({ jokes: j });
    } catch (e) {
      console.log(e);
    }
  }

  generateNewJokes() {
    const lockedJokes = this.state.jokes.filter(j => j.locked);
    this.setState({ jokes: [...lockedJokes] });
  }

  vote(id, delta) {
    this.setState(state => (
      {
        ...state,
        jokes: state.jokes.map(j => (j.id === id ? { ...j, votes: j.votes + delta } : j))
      }
    ));
  }

  toggleLock(id) {
    this.setState(state => (
      {
        ...state,
        jokes: state.jokes.map(j => (j.id === id ? { ...j, locked: !j.locked } : j))
      }
    ));
  }

  componentDidMount() {
    this.getJokes();
  }

  componentDidUpdate() {
    if (this.state.jokes.length !== this.props.numJokesToGet) this.getJokes();
  }

  render() {
    const jokes = this.state.jokes;
    if (jokes.length) {
      let sortedJokes = [...jokes].sort((a, b) => b.votes - a.votes);
    
      return (
        <div className="JokeList">
          <button className="JokeList-getmore" onClick={this.generateNewJokes}>
            Get New Jokes
          </button>
    
          {sortedJokes.map(j => (
            <Joke text={j.joke} key={j.id} id={j.id} votes={j.votes} locked={j.locked} vote={this.vote} toggleLock={this.toggleLock} />
          ))}
        </div>
      );
    }
  
    return null;
  }
}

export default JokeList;
