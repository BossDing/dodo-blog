import React from 'react'
import Head from 'next/head'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'
import AnimateQueue from 'ui/AnimateQueue'
import Icon from 'ui/Icons'
import ScrollDetect from 'ui/ScrollDetect'
import { Tabs } from 'dodoui'

const Tab = Tabs.Item
@inject('musicStore')
@observer
class MusicList extends React.Component {
  handlePlay = () => {
    const { id } = this.props
    const { getListById, currentList, paused } = this.props.musicStore
    if (id.toString() === currentList.songListId.toString()) {
      this.props.musicStore.setValues({ paused: !paused })
    } else {
      localStorage.setItem('current-list-id', id)
      getListById(id).then(() => this.props.musicStore.setValues({ paused: false }))
    }
  }

  render() {
    const { coverImgUrl: pic, title: name, style } = this.props
    const { id } = this.props
    const { currentList, paused } = this.props.musicStore
    const active = !paused && id.toString() === currentList.songListId.toString()

    return (
      <div className={classnames('music-album', active && 'active', 'play')} style={style}>
        <div className="music-album-cover">
          <img src={pic} alt="" />
          <div className={classnames('music-player-play-btn')} onClick={this.handlePlay}>
            <Icon type={active ? 'play' : 'pause'} />
          </div>
        </div>
        <div className="music-album-info">
          <span className="music-album-title">{name}</span>
        </div>
      </div>
    )
  }
}

@inject('musicStore')
@observer
class MusicFilter extends React.Component {
  state = {
    mainCategory: 'all',
    subCategory: ''
  }

  componentDidMount() {
    this.props.musicStore.getCategoryInfo()
  }

  handleToggleMainCategory = mainCategory => {
    this.setState({ mainCategory })
  }

  handleToggleSubCategory = subCategory => {
    this.setState({ subCategory })
    this.props.musicStore.getHotMusicInfo(subCategory)
  }

  getSubCategories = mainCategory => {
    const { categoryInfo } = this.props.musicStore
    return categoryInfo.sub.filter(item => {
      return mainCategory === 'all' ? item.hot : item.category.toString() === mainCategory.toString()
    })
  }

  render() {
    const { categoryInfo } = this.props.musicStore
    const { subCategory, mainCategory } = this.state

    const categories = Object.entries(categoryInfo.categories).map(([value, name]) => ({ value, name }))

    const subCategories = this.getSubCategories(mainCategory)

    const noSub = !subCategories.length

    return (
      <div className="do-common-container">
        <div className={classnames('music-list-tabs-wrapper', noSub && 'music-list-tabs-no-sub', 'hidden-xs')}>
          {!!categories.length && (
            <div className="music-main-tabs">
              <Tabs type="easy" value={mainCategory.toString()} onChange={this.handleToggleMainCategory}>
                <Tab value={'all'}>全部</Tab>
                {categories.map(({ value, name }) => {
                  return (
                    <Tab key={value} value={value}>
                      {name}
                    </Tab>
                  )
                })}
              </Tabs>
            </div>
          )}

          {!noSub && (
            <div className="music-tag-tabs">
              <Tabs type="easy" value={subCategory} onChange={this.handleToggleSubCategory}>
                {subCategories.slice(0, 12).map(({ name }) => {
                  return (
                    <Tab key={name} value={name}>
                      {name}
                    </Tab>
                  )
                })}
              </Tabs>
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default class Musics extends React.Component {
  static getInitialProps() {
    return { audioConfig: { position: 'bottom' }, footer: false }
  }

  state = {
    showNum: 20
  }

  componentDidMount() {
    this.props.musicStore.getHotMusicInfo()
  }

  handleShowMore = () => {
    this.setState({ showNum: this.state.showNum + 20 })
  }

  render() {
    const { hotMusicInfo } = this.props.musicStore
    const { list, loading } = hotMusicInfo
    const { showNum } = this.state
    const noMore = showNum >= list.length

    return (
      <React.Fragment>
        <Head>
          <title>小寒的音乐-列表</title>
          <meta name="keywords" content={'听歌，学习，音乐'} />
          <meta name="description" content={'听听歌，这里有各种各样的好听的音乐，小寒的博客 - 听歌, 音乐, 学习'} />
        </Head>
        <div className="music-list-page">
          <MusicFilter />
          {list.length ? (
            <ScrollDetect onScrollOut={this.handleShowMore} detect={!noMore} protectTime={300}>
              <div className="music-album-list">
                <AnimateQueue
                  animate={true}
                  interval={50}
                  speed={600}
                  from={{ transform: 'translateY(80px)' }}
                  to={{ transform: 'translateX(0px)' }}
                >
                  {list.slice(0, showNum).map((item, index) => (
                    <MusicList key={item.id + index} {...item} />
                  ))}
                </AnimateQueue>
              </div>
            </ScrollDetect>
          ) : null}

          {loading || !noMore ? <div className="do-fetching-loading">加载中...</div> : null}
        </div>
      </React.Fragment>
    )
  }
}
