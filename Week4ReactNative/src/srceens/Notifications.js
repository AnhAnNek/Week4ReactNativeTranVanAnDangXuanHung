import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import notificationService from '../services/notificationService';
import { formatDate } from '../utils/methods';
import { errorToast, successToast } from '../utils/methods';
import authService from "../services/authService";

const Notifications = () => {
  const [user, setUser] = useState(null); // Initially set to null
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserByToken = async () => {
    setLoading(true);
    try {
      const userData = await authService.getCurUser();
      setUser(userData);
    } catch (error) {
      errorToast('An error occurred while fetching user data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserByToken();
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (loading) return; // Prevent fetching if already loading

    setLoading(true);
    try {
      const response = await notificationService.getNotificationsByUsername(user.username, 0, 1000);
      const newNotifications = response.content || []; // Fetch all notifications
      setNotifications(newNotifications);
      console.log("Fetched notifications: ", newNotifications);
    } catch (error) {
      errorToast('Error fetching notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications(); // Fetch notifications again
    setRefreshing(false);
  };

  const handleNotificationClick = async (notificationId, read) => {
    if (!read) {
      try {
        await notificationService.markNotificationAsRead(notificationId);
        successToast('Notification marked as read');
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
      } catch (error) {
        errorToast('Error marking notification as read');
      }
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
        >
          {notifications.length === 0 ? (
            <Text style={styles.noNotifications}>
              No notifications available.
            </Text>
          ) : (
            notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[styles.notificationBox, { backgroundColor: notification.read ? '#f0f0f0' : '#fff' }]}
                onPress={() => handleNotificationClick(notification.id, notification.read)}
              >
                <View style={styles.notificationContent}>
                  <Text>{notification.message}</Text>
                  <Text style={styles.notificationDate}>
                    {formatDate(notification.createdDate)}
                  </Text>
                </View>
                <Text
                  style={[styles.badge, { color: notification.read ? 'green' : 'red' }]}
                >
                  {notification.read ? 'READ' : 'UNREAD'}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  noNotifications: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  notificationBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  badge: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Notifications;