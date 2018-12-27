import React from 'react';
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { Button } from 'dodoui'
import Comment, { CommentList } from 'widgets/Comment'
import { checkNickname } from 'tools/checker'
import AnimateQueue, { Animate } from 'widgets/AnimateQueue'


const Editor = dynamic(() => import('widgets/Editor'), { ssr: false })

export default class Contact extends React.Component {
  state = {
    message: null,
    newMessages: []
  }

  componentDidMount() {
    this.props.contactStore.getLeavedMessages()
  }

  handleSubmit = async e => {
    e.preventDefault();
    const { message } = this.state
    const { leaveMessage, nickname } = this.props.contactStore

    if (!nickname) {
      checkNickname()
    } else {
      if (!message) return false
      const messageContent = message.toHTML()
      if (!messageContent || !messageContent.replace(/<.*?>/g, '')) return false

      this.props.contactStore.nickname &&
        leaveMessage(messageContent)
          .then(message => {
            const newMessages = this.state.newMessages
            newMessages.unshift(message)
            this.setState({ newMessages, message: null })
          })
    }
  }

  handleEditorChange = message => {
    this.setState({ message })
  }

  render() {
    const { nickname, leavedMessages } = this.props.contactStore
    const { message, newMessages } = this.state

    return (
      <React.Fragment>
        <Head>
          <title>小寒的博客 - 联系小寒</title>
          <meta name="keywords" content="前端,设计,技术,文章,个人博客,什么都写,边听歌边看博客" />
          <meta name="description" content="超级有趣的网站，学点技术，学点思想，学点设计" />
        </Head>
        <div className="do-content-container">
          <div className="contact-form">
            <div className="do-group">
              <h2>嗨，{nickname}。。。</h2>
              <Editor
                placeholder={'啦啦啦。。。'}
                value={message}
                onChange={this.handleEditorChange}
              />
            </div>
            <div className="do-group">
              <Button type="primary" onClick={this.handleSubmit}>留言</Button>
            </div>
          </div>

          <CommentList>
            {
              newMessages.map(message => {
                return <Animate
                  animate={true}
                  from={{ transform: 'translateX(80px)' }}
                  to={{ transform: 'translateX(0px)' }}
                  key={message._id}
                  speed={400}
                >
                  <Comment
                    key={message._id}
                    nickname={message.nickname}
                    content={message.message}
                    created={message.created}
                  />
                </Animate>
              })
            }

            <AnimateQueue
              animate={true}
              from={{ transform: 'translateX(80px)' }}
              to={{ transform: 'translateX(0px)' }}
              interval={100}
            >
              {leavedMessages.list.map(message => <Comment
                key={message._id}
                nickname={message.nickname}
                content={message.message}
                created={message.created}
              />)}
            </AnimateQueue>
          </CommentList>
        </div>
      </React.Fragment>
    );
  }
}
