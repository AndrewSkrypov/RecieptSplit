package authHandlers

import (
	"context"
	"encoding/json"
	"fmt"
	"go_server/db"
	"go_server/db/model/userModel"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"golang.org/x/crypto/bcrypt"
)

// JWTClaims - структура для токена
type JWTClaims struct {
	UserID uint `json:"user_id"`
	jwt.RegisteredClaims
}

// Register - регистрация пользователя
func Register(w http.ResponseWriter, r *http.Request) {
	var input userModel.User
	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, "Ошибка декодирования", http.StatusBadRequest)
		return
	}

	// Хэшируем пароль
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Ошибка хеширования пароля", http.StatusInternalServerError)
		return
	}
	input.Password = string(hashedPassword)

	// Сохраняем пользователя в БД
	result := db.DB.Create(&input)
	if result.Error != nil {
		http.Error(w, "Ошибка сохранения пользователя", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	err = json.NewEncoder(w).Encode(map[string]string{"message": "Пользователь зарегистрирован"})
	if err != nil {
		return
	}
}

// Login - вход пользователя
func Login(w http.ResponseWriter, r *http.Request) {
	var user userModel.User
	var input userModel.User

	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, "Ошибка декодирования", http.StatusBadRequest)
		return
	}

	// Ищем пользователя в БД
	result := db.DB.Where("email = ?", input.Email).First(&user)
	if result.Error != nil {
		http.Error(w, "Пользователь не найден", http.StatusUnauthorized)

		return
	}

	// Проверяем пароль
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password))
	if err != nil {
		http.Error(w, "Неверный пароль", http.StatusUnauthorized)
		return
	}

	// Генерируем JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, JWTClaims{
		UserID: user.ID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24)),
		},
	})
	secret := os.Getenv("JWT_SECRET")
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		http.Error(w, "Ошибка генерации токена", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
	if err != nil {
		return
	}
}

// Logout - выход пользователя (удаление сессии)
func Logout(w http.ResponseWriter, r *http.Request) {
	tokenString := r.Header.Get("Authorization")
	if tokenString == "" {
		http.Error(w, "Токен отсутствует", http.StatusUnauthorized)
		return
	}

	w.WriteHeader(http.StatusOK)
	err := json.NewEncoder(w).Encode(map[string]string{"message": "Выход выполнен"})
	if err != nil {
		return
	}
}

// Authenticate - проверка авторизации
func Authenticate(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tokenHeader := r.Header.Get("Authorization")
		if tokenHeader == "" {
			http.Error(w, "Токен отсутствует", http.StatusUnauthorized)
			return
		}

		parts := strings.Split(tokenHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, "Некорректный формат токена", http.StatusUnauthorized)
			return
		}
		tokenString := parts[1]

		// Проверяем токен на совпадение
		secretKey := os.Getenv("JWT_SECRET")
		token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(secretKey), nil
		})
		if err != nil {
			http.Error(w, fmt.Sprintf("Ошибка получения токена: %v", err), http.StatusUnauthorized)
			return
		}
		if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
			// Добавляем claims в контекст запроса
			ctx := context.WithValue(r.Context(), "UserID", claims.UserID)
			next(w, r.WithContext(ctx))
		} else {
			http.Error(w, "Токен не прошёл валидацию", http.StatusUnauthorized)
		}

	}
}
