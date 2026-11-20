package com.intellidesk.service;

import com.intellidesk.dto.analytics.AdminAnalyticsResponse;
import com.intellidesk.dto.analytics.SlaBreachTicketDto;

import java.util.List;

public interface AnalyticsService {

    AdminAnalyticsResponse getAdminAnalytics();

    List<SlaBreachTicketDto> getSlaBreaches(int page, int size);
}
