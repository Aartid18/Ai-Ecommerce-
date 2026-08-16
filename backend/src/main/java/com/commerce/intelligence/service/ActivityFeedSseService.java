package com.commerce.intelligence.service;

import lombok.Builder;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class ActivityFeedSseService {

    private static final Logger log = LoggerFactory.getLogger(ActivityFeedSseService.class);
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(0L); // Keep-alive indefinitely
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError((e) -> emitters.remove(emitter));

        try {
            emitter.send(SseEmitter.event()
                    .name("INIT")
                    .data(ActivityEvent.builder()
                            .type("INFO")
                            .message("Connected to Real-time Operations Center")
                            .timestamp(LocalDateTime.now().toString())
                            .build()));
        } catch (IOException e) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    public void publishEvent(String type, String message, String entityId, String linkUrl) {
        ActivityEvent event = ActivityEvent.builder()
                .type(type) // ORDER, STOCK, RISK, RETURN, PREORDER, PAYMENT
                .message(message)
                .entityId(entityId)
                .linkUrl(linkUrl)
                .timestamp(LocalDateTime.now().toString())
                .build();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("ACTIVITY_EVENT").data(event));
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }
    }

    @Data
    @Builder
    public static class ActivityEvent {
        private String type;
        private String message;
        private String entityId;
        private String linkUrl;
        private String timestamp;
    }
}
