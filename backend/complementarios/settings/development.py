import os
from .base import *

DEBUG = True

ALLOWED_HOSTS = ['*']

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'complementarios',
        'USER': 'complementarios',
        'PASSWORD': 'complementarios2023*-',
        'HOST': '172.25.52.9',
        'PORT': '5432'
    },
}

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
        'LOCATION': os.path.join(BASE_DIR, 'cache'),
        'TIMEOUT': 1800 #MEDIA HORA
    }
}

CORS_ALLOW_ALL_ORIGINS = True

AUTH_ENABLED = True

LDAP_SETTINGS = {
    'server': '172.25.1.121',
    'port': '389',
    'user': 'sincro-intra',
    'password': 's0p0rt3DEP'
}