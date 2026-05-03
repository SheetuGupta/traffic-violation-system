package com.traffic.traffic_violation_api.controller;

import com.traffic.traffic_violation_api.entity.FineConfiguration;
import com.traffic.traffic_violation_api.service.FineConfigurationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/fine-configurations")
public class FineConfigurationController {

    @Autowired
    private FineConfigurationService service;

    @GetMapping
    public List<FineConfiguration> getAll() {
        return service.getAll();
    }

    @PostMapping
    public FineConfiguration saveOrUpdate(@RequestBody FineConfiguration config) {
        return service.save(config);
    }
}
