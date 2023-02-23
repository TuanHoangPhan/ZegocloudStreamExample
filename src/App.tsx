
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Home from './Home';
import Room, { RoomConfig } from './Room';

export type RootStackParamList = {
    Home: undefined;
    Room: {
        config: RoomConfig,
        userID: string,
        liveID: string
    };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export type RoomProps = NativeStackScreenProps<RootStackParamList, 'Room'>;
export type HomeProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function App() {

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }} >
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name='Room' component={Room} />
            </Stack.Navigator>
        </NavigationContainer>
    )
};
