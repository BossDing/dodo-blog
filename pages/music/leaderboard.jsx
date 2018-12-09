import React from 'react'
import Icon from 'widgets/Icons'
import AnimateQueue from 'widgets/AnimateQueue'
import ScrollDetect from 'widgets/ScrollDetect'
import { inject, observer } from 'mobx-react'
import classnames from 'classnames'
import { downloadFile } from 'tools'

@inject('musicStore')
@observer
class MusicItem extends React.Component {
  handlePlay = () => {
    const music = this.props
    const { currentMusic, leaderboard: musics, paused } = this.props.musicStore
    if (music.id === currentMusic.id && !paused) {
      return this.props.musicStore.setValues({ paused: true })
    }

    this.props.musicStore.setValues({
      paused: false,
      currentList: musics,
      currentMusic: music
    })

    localStorage.setItem('current-list-id', musics.songListId)
    localStorage.setItem('current-music-id', music.id)
  }

  handleDownLoad = () => {
    downloadFile(this.props.url)
  }

  render() {
    const { id, name, singer, pic, style, NO } = this.props
    const { currentMusic, paused } = this.props.musicStore
    const active = id === currentMusic.id

    return (
      <li className="music-info-item" style={style}>
        <span className="music-info-no">{NO}</span>
        <div className="music-info-pic hidden-xs">
          <img className="music-info-cover" src={pic} alt={name} />
        </div>
        <span className="music-info-name">{name}</span>
        <span className="music-info-singer">{singer}</span>
        <span className="music-info-toggle">
          <div className={classnames('music-info-btn', active && 'active')} onClick={() => this.handlePlay()}>
            <Icon type={active && !paused ? 'play' : 'pause'} />
          </div>
          <div className={classnames('music-info-btn')} onClick={() => this.handleDownLoad()}>
            <Icon antd={true} type={'download'} />
          </div>
        </span>
      </li>
    )
  }
}

export default class Search extends React.Component {
  static async getInitialProps() {
    return { audioConfig: { size: 'large', position: 'bottom' }, footer: false }
  }

  state = { showNum: 12 }

  componentDidMount() {
    this.props.musicStore.getLeaderboard()
  }

  handleShowMore = () => {
    this.setState({ showNum: this.state.showNum + 12 })
  }

  render() {
    const { songs = [] } = this.props.musicStore.leaderboard
    const { showNum } = this.state

    return (
      <div className="music-leader-page">
        <div className="do-content-container">
          <ScrollDetect onScrollOut={this.handleShowMore}>
            <div className="music-info-list-wrapper">
              <ul className="music-info-list">
                <AnimateQueue
                  animate={true}
                  interval={50}
                  speed={600}
                  from={{ transform: 'translateY(80px)' }}
                  to={{ transform: 'translateX(0px)' }}
                >
                  {songs.slice(0, showNum).map((music, key) => <MusicItem key={music.id} NO={key + 1} {...music} />)}
                </AnimateQueue>
              </ul>
              {showNum < songs.length && <div className="fetching-loading">加载中...</div>}
            </div>
          </ScrollDetect>
        </div>
      </div>
    )
  }
}