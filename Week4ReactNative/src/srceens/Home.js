import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { ActivityIndicator, Card, Snackbar, Text } from 'react-native-paper';
import { API_URL } from '../utils/constants';
import { getToken, removeToken } from '../utils/authUtils';
import { get } from '../utils/httpRequest';
import tw from 'twrnc';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import CourseScreen from './Course';
import BestSale from './BestSale';
import MyLearn from './MyLearn';
import Wishlist from './Wishlist';
import Account from './Account';
import Notifications from "./Notifications";

function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const fetchUserByToken = async () => {
    setLoading(true);
    try {
      const tokenStr = await getToken();
      const response = await get(`${API_URL}/auth/get-user-by-token`, {
        params: { tokenStr },
      });
      if (response.status === 200) {
        setUser(response.data);
      } else {
        setSnackbarMessage('User not found.');
        setSnackbarVisible(true);
      }
    } catch (error) {
      setSnackbarMessage('An error occurred while fetching user data.');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => null,
    });

    fetchUserByToken();
  }, []);

  const logout = () => {
    removeToken();
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={tw`flex-1 justify-center p-5`}>
      <Text style={tw`text-2xl font-bold text-center mb-5`}>User Profile</Text>
      {loading ? (
        <ActivityIndicator animating={true} />
      ) : (
        <Card>
          {user ? (
            <Card.Content>
              <Text style={tw`text-lg font-bold mb-2`}>
                Full name: {user.fullName}
              </Text>
              <Text style={tw`text-base mb-1`}>Username: {user.username}</Text>
              <Text style={tw`text-base mb-1`}>Email: {user.email}</Text>
              <Text style={tw`text-base mb-1`}>
                Phone Number: {user.phoneNumber}
              </Text>
              <Text style={tw`text-base mb-1`}>Date of Birth: {user.dob}</Text>
              <Text style={tw`text-base mb-1`}>Gender: {user.gender}</Text>
              <Text style={tw`text-base mb-1`}>Role: {user.role}</Text>
              <Text style={tw`text-base mb-1`}>
                Bio: {user.bio || 'No bio available'}
              </Text>
              <Text style={tw`text-base mb-1`}>
                Account Created: {new Date(user.createdAt).toLocaleDateString()}
              </Text>
            </Card.Content>
          ) : (
            <Card.Content>
              <Text style={tw`text-base text-center`}>
                No user found. Please enter a username.
              </Text>
            </Card.Content>
          )}
        </Card>
      )}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}>
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
}


const Tab = createBottomTabNavigator();

export default function Home() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Course') {
            iconName = focused ? 'book' : 'book-outline';
          }
          else if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          }
          else if (route.name === 'MyLearn') {
            iconName = focused ? 'play' : 'play-outline';
          }
          else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          }
          else if (route.name === 'Wishlist') {
            iconName = focused ? 'heart' : 'heart-outline';
          }
          else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}>
      <Tab.Screen name="Home" component={BestSale} />
      <Tab.Screen name="Course" component={CourseScreen} />
      <Tab.Screen name="MyLearn" component={MyLearn} />
      <Tab.Screen name="Notifications" component={Notifications} />
      <Tab.Screen name="Wishlist" component={Wishlist} />
      <Tab.Screen name="Account" component={Account} />
    </Tab.Navigator>
  );
}