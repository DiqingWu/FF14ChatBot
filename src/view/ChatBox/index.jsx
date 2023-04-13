import React, { useState, useRef, useEffect } from "react";
import { Button, Input, Layout, List, Select, Spin, Alert, Switch } from "antd";
import { SendOutlined } from "@ant-design/icons";
// import axios from 'axios';
import { getOpenAIResponse } from "../../service/ChatGPTService";
import {
  CHATHISTORYKEY,
  MAXTOKEN,
  OPENAI_API_Davinci02,
  OPENAI_API_Davinci03,
  OPENAI_API_Turbo35,
  OPENAI_SETTINGS_INITIALMESSAGE,
  OPENAI_SETTINGS_PERSONALITY,
  SHORTTERMMAXHOLD,
} from "../../setting/config";
const { TextArea } = Input;
const { Content, Footer, Header } = Layout;

const ChatBox = () => {
  const [messages, setMessages] = useState([]); // 存储聊天消息的状态
  const [inputValue, setInputValue] = useState(""); // 存储用户输入的状态
  const inputRef = useRef(null); // 对话框中的输入框引用
  const [shortTerm, setshortTerm] = useState(true);
  const [personality, setPersonality] = useState(  OPENAI_SETTINGS_PERSONALITY  );
  const [isLoading, setisLoading] = useState(false);
  const [selectedEngine, setselectedEngine] = useState(OPENAI_API_Turbo35);

  useEffect(() => {
    // 下面的代码可以将
    // const history = getObject(chatHistoryKey);
    // if(history && history.length > 0){
    //   console.log("oldhistory",history);
    //   setMessages(history)
    // }
    // else{
    //   console.log("newhistory",history);
    //   setMessages([{ content: initialMessage, isUser: false }])
    // }
    setMessages([{ content: OPENAI_SETTINGS_INITIALMESSAGE, isUser: false }])
  }, []);

  // useEffect(() => {
  //   // clear chat
  //   setMessages([]);
  // }, [personality]);

  useEffect(() => {
    // 当消息更新时，将对话框滚动到底部以显示最新消息
    if (inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 处理用户输入并发送聊天消息
  const handleSendMessage = async () => {
    if (!inputValue.trim()) {
      return;
    }
    setisLoading(true);
    setMessages((prevMessages) => [
      ...prevMessages,
      { content: inputValue, isUser: true },
    ]);
    setInputValue("");
    try {
      const response = await getOpenAIResponse(
        handleProcessPrompt() +
          addCall({ content: inputValue, isUser: true }, true),
        selectedEngine
      );
      setMessages((prevMessages) => [
        ...prevMessages,
        { content: response, isUser: false },
      ]);
      setObject(CHATHISTORYKEY, (prevMessages) => [
        ...prevMessages,
        { content: response, isUser: false },
      ])
      setisLoading(false);
    } catch (error) {
      console.error(error);
      setisLoading(false);
    }
  };

  const handleProcessPrompt = () => {
    if (shortTerm) {
      let result = "";
      let startPosition = messages.length > SHORTTERMMAXHOLD ? messages.length - SHORTTERMMAXHOLD : 0;
      for (let i = startPosition; i < messages.length; i++) {
        result += addCall(messages[i]);
      }
      return addSystemCall() + result;
    }else{
      let result = "";
      let totalLength = 0;
      let startPosition = 0;

      for (let i = 0; i < messages.length; i++) {
        if(messages[i].length + totalLength > MAXTOKEN){
          startPosition = i - 1;
          break;
        }
        totalLength += messages[i].length;
        result += addCall(messages[i]);
      }
      for (let i = startPosition; i < messages.length; i++) {
        result += addCall(messages[i]);
      }
      return addSystemCall() + result;
    }
    // 下面这段代码会把全部的 prompt都写进去，会因为prompt太长然后炸了。
    // return (
    //   addSystemCall() +
    //   messages
    //     .map((msg) => {
    //       return addCall(msg);
    //     })
    //     .join()
    // );
  };

  const addSystemCall = () => {
    return "<|im_start|>system\n" + personality + "\n<|im_end|>\n";
  };

  const addCall = (msg, isEnd = false) => {
    return (
      "<|im_start|>" +
      (msg.isUser ? "user" : "assistant") +
      "\n" +
      msg.content +
      "\n<|im_end|>" +
      (isEnd ? "\n<|im_start|> assistant \n" : "\n")
    );
  };

  // 将 JavaScript 对象存储在本地存储中
function setObject(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// 从本地存储中检索 JavaScript 对象
function getObject(key) {
  const value = localStorage.getItem(key);
  if (value) {
    console.log("value: ", value);
    return JSON.parse(value);
  }
  return null;
}

  return (
    <>
      <Layout style={{ height: "100vh" }}>
        <Content style={{ padding: "50px" }}>
          {/* 下面的代码是当网站维护的时候打开的 */}
          {/* <Alert
            // message="注意！"
            message="Note: 5 short term 只会记住5个当前对话，full term会有全部记忆。但是full term很贵!。"
            type="warning"
            showIcon
          /> */}
          {/* 下面的代码可以选择chatGPT 的模板 目前default的是 3.5 turbo */}
          {/* <Header>
            <div style={{ color: "white" }}>
              目前的model：
              <Select
                showSearch
                placeholder="Select a person"
                optionFilterProp="children"
                defaultValue={"gpt-35-turbo"}
                onChange={(value) => {
                  switch (value) {
                    case "gpt-35-turbo":
                      setselectedEngine(OPENAI_API_Turbo35);
                      break;
                    case "text-davinci-002":
                      setselectedEngine(OPENAI_API_Davinci02);
                      break;
                    case "text-davinci-003":
                      setselectedEngine(OPENAI_API_Davinci03);
                      break;
                    default:
                      setselectedEngine(OPENAI_API_Turbo35);
                  }
                }}
                // onSearch={()={}}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={[
                  {
                    value: "gpt-35-turbo",
                    label: "gpt-35-turbo",
                  },
                  {
                    value: "text-davinci-002",
                    label: "text-davinci-002",
                  },
                  {
                    value: "text-davinci-003",
                    label: "text-davinci-003",
                  },
                ]}
              />
              <Switch
                style={{ marginLeft: "50px" }}
                checkedChildren="5 Short Term"
                unCheckedChildren="Full Term"
                defaultChecked={shortTerm}
                onChange={(check) => {
                  setshortTerm(check);
                }}
              />
            </div>
          </Header> */}
          {/* 下面的代码打开后可以让用户自行更改人设 */}
          {/* 以下是你的人设
          <TextArea
            size="large"
            showCount
            maxLength={800}
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
          />
          <div style={{ height: '20px' }}></div> */}
          
          <div style={{paddingBottom: '50px'}}>
            FF14 panda 小助手
          </div>
          <List
            dataSource={messages}
            renderItem={(message, index) => (
              <List.Item>
                <div
                  key={index}
                  style={{
                    width: "100%",
                    textAlign: message.isUser ? "right" : "left",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      padding: 8,
                      borderRadius: 4,
                      textAlign: message.isUser ? "right" : "left",
                      backgroundColor: message.isUser ? "#f0f0f0" : "#1890ff",
                      color: message.isUser ? "#000" : "#fff",
                    }}
                  >
                    {message.content}
                  </div>
                </div>
              </List.Item>
            )}
          />
          {isLoading ? <Spin size="large" /> : null}
          <Input.Search
            disabled={isLoading}
            placeholder="Type your message here..."
            enterButton={
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                disabled={isLoading}
              />
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            // onSearch={handleOnSearch}
            size="large"
          />
        </Content>
        <Footer style={{ padding: "20px" }}></Footer>
      </Layout>
    </>
  );
};

export default ChatBox;
