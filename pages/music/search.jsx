import React from 'react'
import AnimateQueue from 'widgets/AnimateQueue'
import classnames from 'classnames'
import Icon from 'widgets/Icons'
import ScrollDetect from 'widgets/ScrollDetect'
import { observer, inject } from 'mobx-react';


@inject('musicStore')
@observer
class SearchedItem extends React.Component {
  handlePlay = () => {
    const { musicStore, style, ...music } = this.props
    const { currentMusic, paused } = musicStore

    if (music.id === currentMusic.id) {
      return this.props.musicStore.setValues({ paused: !paused })
    }

    this.props.musicStore.appendMusic(music)
    this.props.musicStore.setValues({
      paused: false,
      currentMusic: music,
    })
  }

  render() {
    const { name, singer, id, style } = this.props
    const { currentMusic, paused } = this.props.musicStore
    const active = id === (currentMusic && currentMusic.id)

    return (
      <li className="music-info-item" style={style}>
        <span className="music-info-name">{name}</span>
        <span className="music-info-singer">{singer}</span>
        <span className="music-info-toggle" onClick={() => this.handlePlay()}>
          <div className={classnames('music-info-play-btn', active && 'active')}>
            <Icon type={active && !paused ? 'play' : 'pause'} />
          </div>
        </span>
      </li>
    )
  }
}

export default class Search extends React.Component {
  static getInitialProps() {
    return { audioConfig: { position: 'bottom' }, footer: false }
  }

  state = {
    searched: this.props.musicStore.searchValue,
    showNum: 12
  }

  componentWillUnmount() {
    clearTimeout(this.changeTimer)
  }

  handleSearch = () => {
    this.props.musicStore.search(this.state.searched)
  }

  handleChange = e => {
    this.setState({ searched: e.target.value })
    clearTimeout(this.changeTimer)
    this.changeTimer = setTimeout(() => this.handleSearch(), 1000)
  }

  handleShowMore = () => {
    this.setState({ showNum: this.state.showNum + 12 })
  }

  render() {
    const { searchedList } = this.props.musicStore
    const { searched, showNum } = this.state
    const hasResult = searchedList && searchedList.length

    return (
      <div className="music-search-page">
        <div className="do-content-container">
          <div className="music-search-wrapper" style={{ top: hasResult ? '0vh' : '25vh' }}>
            <div className="music-search">
              <input value={searched} placeholder="告诉我你想听什么呀" className="music-search-input" type="text" onChange={this.handleChange} onKeyDown={e => e.keyCode === 13 && this.handleSearch()} />
              <button className="music-search-btn" onClick={this.handleSearch}>搜索</button>
            </div>
          </div>

          {
            hasResult
              ? (
                <ScrollDetect onScrollOut={this.handleShowMore} protectTime={500}>
                  <div className="music-info-list-wrapper">
                    <ul className="music-info-list music-search-list">
                      <AnimateQueue
                        animate={true}
                        interval={50}
                        speed={600}
                        from={{ transform: 'translateY(80px)' }}
                        to={{ transform: 'translateX(0px)' }}
                      >
                        {searchedList.slice(0, showNum).map(music => <SearchedItem key={music.id} {...music} />)}
                      </AnimateQueue>
                    </ul>
                    {showNum < searchedList.length && <div className="fetching-loading">加载中...</div>}
                  </div>
                </ScrollDetect>
              )
              : null
          }
        </div>
      </div>
    )
  }
}