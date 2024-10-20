import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Để sử dụng icon FontAwesome
import courseService from '../services/courseService'; // Gọi API từ courseService
import IconR from 'react-native-vector-icons/Ionicons';

// Component để hiển thị đánh giá sao
const Rating = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
        stars.push(<Icon key={`full-${i}`} name="star" size={16} color="#f5a623" />);
    }
    if (halfStar) {
        stars.push(<Icon key="half" name="star-half" size={16} color="#f5a623" />);
    }
    while (stars.length < 5) {
        stars.push(<Icon key={`empty-${stars.length}`} name="star-o" size={16} color="#f5a623" />);
    }

    return <View style={styles.ratingContainer}>{stars}</View>;
};

// Component hiển thị từng khóa học
const CourseItem = ({ course }) => {
    return (
        <View style={styles.courseContainer}>
            <Image source={{ uri: course.imagePreview }} style={styles.courseImage} />
            <View style={styles.courseInfo}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.courseInstructor}>{course.teacher}</Text>
                <View style={styles.ratingRow}>
                    <Text style={styles.courseRating}>{course.rating}</Text>
                    <Rating rating={course.rating} />
                    <Text style={styles.courseReviews}>({course.ratingCount})</Text>
                </View>
                <Text style={styles.coursePrice}>{`${course.realPrice} ₫`}</Text>
                {course.isBestseller && (
                    <TouchableOpacity style={styles.bestsellerBadge}>
                        <Text style={styles.bestsellerText}>Bestseller</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

// Component chính hiển thị danh sách khóa học
const Course = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(''); // Trạng thái tìm kiếm

    // Lấy dữ liệu khóa học từ API
    const fetchCourses = async () => {
        try {
            const courseRequest = { createdBy: 'hungsam' }; // Ví dụ dữ liệu request
            const fetchedCourses = await courseService.getAllCourseNotOfStudent(courseRequest);
            setCourses(fetchedCourses || []); // Nếu không có dữ liệu thì trả về mảng rỗng
        } catch (error) {
            console.error('Lỗi khi lấy danh sách khóa học:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    // Hàm lọc khóa học dựa trên từ khóa tìm kiếm
    const filteredCourses = courses.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Hiển thị loading spinner khi đang tải dữ liệu
    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.searchBarContainer}>
                <IconR name="search-outline" size={20} color="#000" />
                <TextInput
                    style={styles.searchBar}
                    placeholder="Tìm kiếm khóa học..."
                    placeholderTextColor="#ccc"
                    value={searchQuery}
                    onChangeText={setSearchQuery} // Cập nhật trạng thái khi thay đổi văn bản
                />
                <TouchableOpacity >
                    <IconR name="filter-outline" size={20} color="#000" />
                </TouchableOpacity>
            </View>
            <FlatList
                data={filteredCourses}
                renderItem={({ item }) => <CourseItem course={item} />}
                keyExtractor={(item) => item.id.toString()}
            />
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff', // Nền trắng
        padding: 10,
        borderRadius: 8,
        marginVertical: 10,
        borderColor: '#ccc',
        borderWidth: 1,
    },
    searchBar: {
        flex: 1,
        marginLeft: 10,
        color: '#000', // Chữ đen
        fontSize: 16,
    },
    courseContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    courseImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    courseInfo: {
        flex: 1,
        marginLeft: 15,
    },
    courseTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    courseInstructor: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    courseRating: {
        fontSize: 14,
        color: '#f5a623',
        marginRight: 5,
    },
    ratingContainer: {
        flexDirection: 'row',
        marginRight: 5,
    },
    courseReviews: {
        fontSize: 12,
        color: '#666',
    },
    coursePrice: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 5,
    },
    bestsellerBadge: {
        backgroundColor: '#f5f5a3',
        paddingVertical: 2,
        paddingHorizontal: 10,
        borderRadius: 5,
        alignSelf: 'flex-start',
    },
    bestsellerText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Course;
