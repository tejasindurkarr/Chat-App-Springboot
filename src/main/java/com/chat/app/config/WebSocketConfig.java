package com.chat.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    // Clients will connect to /ws endpoint; SockJS fallback enabled
	  registry.addEndpoint("/ws")
      .setAllowedOrigins("*")
      .withSockJS();

  }

  @Override
  public void configureMessageBroker(MessageBrokerRegistry registry) {
    // Messages whose destination starts with /app are routed to @MessageMapping handlers
    registry.setApplicationDestinationPrefixes("/app");

    // Simple in-memory broker for topics (broadcasts) and queues
    registry.enableSimpleBroker("/topic", "/queue");
  }
}
