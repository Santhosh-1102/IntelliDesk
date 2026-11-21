# Stage 1: Build Application
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B -Daether.syncContext.named.factory=noop || true
COPY src ./src
RUN mvn clean package -DskipTests -Daether.syncContext.named.factory=noop

# Stage 2: Hardened Runtime Container
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as non-root user for security
RUN addgroup -S intellidesk && adduser -S intellidesk -G intellidesk
RUN mkdir -p /app/uploads/documents && chown -R intellidesk:intellidesk /app

COPY --from=builder /app/target/intellidesk-backend-*.jar app.jar
USER intellidesk

EXPOSE 8080

ENV JAVA_OPTS="-Xms256m -Xmx1024m"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
