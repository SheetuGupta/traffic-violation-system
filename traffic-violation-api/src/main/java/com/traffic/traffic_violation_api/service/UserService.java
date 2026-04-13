package com.traffic.traffic_violation_api.service;

import com.traffic.traffic_violation_api.entity.User;
import com.traffic.traffic_violation_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    //save user
    public User saveUser(User user){
        return userRepository.save(user);
    }
   //find all users
    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    //find user by their id
    public User getUserById(Long id){
        return userRepository.findById(id).orElse(null);
    }
    //delete by id
    public void deleteUser(Long id){
        userRepository.deleteById(id);
    }
    //update
    public User updateUser(Long id, User newUser) {

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        existingUser.setName(newUser.getName());
        existingUser.setEmail(newUser.getEmail());
        existingUser.setPassword(newUser.getPassword());
        existingUser.setRole(newUser.getRole());
        existingUser.setPhoneNumber(newUser.getPhoneNumber());

        return userRepository.save(existingUser);
    }

}
