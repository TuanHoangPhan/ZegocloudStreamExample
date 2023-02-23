import React, { useEffect, useState, useCallback } from 'react';
import { Image, Text, ImageBackground, Alert } from 'react-native';

import {
  StyleSheet,
  View,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import ZegoUIKit, {
  ZegoLeaveButton,
  ZegoAudioVideoView,
  ZegoInRoomMessageInput,
  ZegoInRoomMessageView,
} from '@zegocloud/zego-uikit-rn';
import ZegoBottomBar from './ZegoBottomBar';
import { useKeyboard } from '../utils/keyboard';
import ZegoMenuBarButtonName from "./ZegoMenuBarButtonName";
import { RoomProps } from './App';

export type RoomConfig = {
  showSoundWavesInAudioMode: boolean;
  turnOnCameraWhenJoining: boolean;
  turnOnMicrophoneWhenJoining: boolean;
  useSpeakerWhenJoining: boolean;
  showInRoomMessageButton: boolean;
  menuBarButtons: number[];
  menuBarButtonsMaxCount: number;
  menuBarExtendedButtons: number[];
}

const HOST_DEFAULT_CONFIG = {
  showSoundWavesInAudioMode: true,
  turnOnCameraWhenJoining: true,
  turnOnMicrophoneWhenJoining: true,
  useSpeakerWhenJoining: true,
  showInRoomMessageButton: true,
  menuBarButtons: [ZegoMenuBarButtonName.toggleCameraButton, ZegoMenuBarButtonName.toggleMicrophoneButton, ZegoMenuBarButtonName.switchCameraButton],
  menuBarButtonsMaxCount: 5,
  menuBarExtendedButtons: [],
};
const AUDIENCE_DEFAULT_CONFIG = {
  showSoundWavesInAudioMode: true,
  turnOnCameraWhenJoining: false,
  turnOnMicrophoneWhenJoining: false,
  useSpeakerWhenJoining: true,
  showInRoomMessageButton: true,
  menuBarButtons: [],
  menuBarButtonsMaxCount: 0,
  menuBarExtendedButtons: [],
};

export {
  HOST_DEFAULT_CONFIG,
  AUDIENCE_DEFAULT_CONFIG
}

// https://github.com/react-native-community/hooks#usekeyboard
export default function Room(props: RoomProps) {

  const navigation = props.navigation

  const {
    config,
    userID,
    liveID
  } = props.route.params

  const {
    showSoundWavesInAudioMode = false,

    turnOnCameraWhenJoining = false,
    turnOnMicrophoneWhenJoining = false,
    useSpeakerWhenJoining = false,

    showInRoomMessageButton = false,

    menuBarButtons = [],
    menuBarButtonsMaxCount = 0,
    menuBarExtendedButtons = [],
  } = config;

  const keyboardHeight = useKeyboard();
  const [textInputVisable, setTextInputVisable] = useState(false);
  const [textInput, setTextInput] = useState(null);
  const [textInputHeight, setTextInputHeight] = useState(45);

  const [hostID, setHostID] = useState(
    turnOnCameraWhenJoining || turnOnMicrophoneWhenJoining ? userID : ''
  );

  const [memberCount, setMemberCount] = useState(
    // turnOnCameraWhenJoining || turnOnMicrophoneWhenJoining ? 1 : 0
    1
  );

  const onFullPageTouch = () => {
    setTextInputVisable(false);
  };

  const callbackID = 'ZegoUIKitPrebuiltLiveStreaming' + String(Math.floor(Math.random() * 10000));
  ZegoUIKit.onAudioVideoAvailable(callbackID, (users: any[]) => {
    if (users.length > 0) {
      setHostID(users[0].userID);
    }
  });
  ZegoUIKit.onUserJoin(callbackID, () => {
    setMemberCount(ZegoUIKit.getAllUsers().length);
  });
  ZegoUIKit.onUserLeave(callbackID, (users: any[]) => {
    users.forEach((user) => {
      if (user.userID == hostID) {
        setHostID('');
      }
    });
    setMemberCount(ZegoUIKit.getAllUsers().length);
  });
  useEffect(() => {
    return () => {
      ZegoUIKit.onAudioVideoAvailable(callbackID);
      ZegoUIKit.onUserJoin(callbackID);
      ZegoUIKit.onUserLeave(callbackID);
    };
  }, []);
  useEffect(() => {

    ZegoUIKit.turnCameraOn('', turnOnCameraWhenJoining);
    ZegoUIKit.turnMicrophoneOn('', turnOnMicrophoneWhenJoining);
    ZegoUIKit.setAudioOutputToSpeaker(useSpeakerWhenJoining);
    ZegoUIKit.joinRoom(liveID);

    return () => {
      ZegoUIKit.turnCameraOn('', false);
      ZegoUIKit.turnMicrophoneOn('', false);
      ZegoUIKit.setAudioOutputToSpeaker(false);
      ZegoUIKit.leaveRoom();
    };
  }, []);

  const showDefaultLeaveDialog = () => {
    return new Promise<void>((resolve, reject) => {

      const title = "Leave the live streaming"
      const message = "Are you sure to leave the live streaming?"
      const cancelButtonName = "Cancel"
      const confirmButtonName = "Confirm"
      Alert.alert(
        title,
        message,
        [
          {
            text: cancelButtonName,
            onPress: () => reject(),
            style: "cancel"
          },
          {
            text: confirmButtonName,
            onPress: () => resolve()
          }
        ]
      );
    })
  }

  const onLeaveRoom = useCallback(() => {
    ZegoUIKit.turnCameraOn('', false);
    ZegoUIKit.turnMicrophoneOn('', false);
    ZegoUIKit.setAudioOutputToSpeaker(false);
    navigation.goBack()
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.fillParent}>
        {hostID != '' ? (
          <ZegoAudioVideoView
            userID={hostID}
            foregroundBuilder={() => <View />}
            useVideoViewAspectFill={true}
            showSoundWave={showSoundWavesInAudioMode}
          />
        ) : (
          <View style={styles.fillParent}>
            <ImageBackground
              style={styles.noHostBg}
              source={require('../resources/background.png')}
            >
              <Text style={styles.noHostTips}>No host is currently online</Text>
            </ImageBackground>
          </View>
        )}
      </View>

      <View style={styles.messageListView}>
        <ZegoInRoomMessageView style={styles.fillParent} />
      </View>

      <View style={styles.leaveButton}>
        <ZegoLeaveButton
          style={styles.fillParent}
          onLeaveConfirmation={showDefaultLeaveDialog}
          onPressed={onLeaveRoom}
          iconLeave={require('../resources/white_top_button_close.png')}
        />
      </View>
      <View style={styles.memberButton}>
        <Image source={require('../resources/white_top_button_member.png')} />
        <Text style={styles.memberCountLabel}>{memberCount}</Text>
      </View>

      <View
        pointerEvents="auto"
        onTouchStart={onFullPageTouch}
        style={[
          styles.dismissArea,
          {
            bottom:
              (Platform.OS == 'ios'
                ? keyboardHeight + textInputHeight
                : textInputHeight) + 10,
          },
        ]}
      />
      <KeyboardAvoidingView
        style={[styles.fillParent, { zIndex: 9 }]}
        behavior={'padding'}
      >
        {Platform.OS != 'ios' && keyboardHeight > 0 ? null : (
          <ZegoBottomBar
            menuBarButtonsMaxCount={menuBarButtonsMaxCount}
            menuBarButtons={menuBarButtons}
            menuBarExtendedButtons={menuBarExtendedButtons}
            turnOnCameraWhenJoining={turnOnCameraWhenJoining}
            turnOnMicrophoneWhenJoining={turnOnMicrophoneWhenJoining}
            useSpeakerWhenJoining={useSpeakerWhenJoining}
            showInRoomMessageButton={showInRoomMessageButton}
            onLeaveLiveStreamingConfirming={showDefaultLeaveDialog}
            onLeaveLiveStreaming={onLeaveRoom}
            onMoreButtonPress={() => { }}
            onMessageButtonPress={() => {
              setTextInputVisable(true);
            }}
          />
        )}
        {textInputVisable ? (
          <View
            style={[
              styles.messageInputPannel,
              {
                bottom: Platform.OS == 'ios' ? keyboardHeight : 0,
                height: textInputHeight,
              },
            ]}
          >
            <ZegoInRoomMessageInput
              ref={(input: any) => {
                setTextInput(input);
              }}
              onContentSizeChange={(width: number, height: number) => {
                setTextInputHeight(height);
              }}
              placeholder={'Say something...'}
              onSumit={() => {
                setTextInputVisable(false);
              }}
            />
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  messageListView: {
    position: 'absolute',
    left: 16,
    bottom: 62,
    width: 270,
    maxHeight: 200,
    zIndex: 12,
  },
  messageInputPannel: {
    position: 'absolute',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7500)',
    width: '100%',
    zIndex: 11,
  },
  container: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  fillParent: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  leaveButton: {
    position: 'absolute',
    top: 32,
    right: 10,
    zIndex: 10,
  },
  memberButton: {
    position: 'absolute',
    top: 42,
    right: 52,
    width: 53,
    height: 28,
    backgroundColor: 'rgba(30, 39, 64, 0.4000)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 17,
    zIndex: 10,
  },
  memberCountLabel: {
    fontSize: 14,
    color: 'white',
    marginLeft: 3,
  },
  dismissArea: {
    zIndex: 11,
    width: '100%',
    top: 80,
    position: 'absolute',
  },
  noHostBg: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noHostTips: {
    width: 330,
    height: 90,
    fontSize: 32,
    fontFamily: 'PingFangSC-Regular, PingFang SC',
    lineHeight: 45,
    color: 'white',
    textAlign: 'center',
  },
});