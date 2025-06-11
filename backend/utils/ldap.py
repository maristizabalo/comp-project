import re
from enum import Enum
from ldap3 import Server, Connection, SUBTREE
from django.conf import settings


LDAP_SETTINGS = settings.LDAP_SETTINGS
AUTH_ENABLED = settings.AUTH_ENABLED

USER_FORMAT = "{}@espacio.int"
ATTRIBUTES_STR = "attributes"
SEARCH_RESULT_STR = "searchResEntry"
RESULT_TYPE_STR = "type"
SEARCH_MAX_RESULTS = 15
BASE_DN = "dc=espacio,dc=int" 
COMPLETE_ATTRS = [
      "cn",
      "sAMAccountName",
      "mail",
      "distinguishedName",
      "userPrincipalName",
      "userAccountControl",
      "accountExpires",
      "givenName",
      "sn",
      "description",
      "distinguishedName",
      "streetaddress"
]


class Ldap:
  
  def __init__(self, server=LDAP_SETTINGS['server'], 
                  port=int(LDAP_SETTINGS['port']), 
                  user=LDAP_SETTINGS['user'], 
                  password=LDAP_SETTINGS['password']):

    self.server = server
    self.port = port
    self.user = user
    self.password = password

    user_format = USER_FORMAT.format(user)

    self.connection = Connection(
                      Server(server, port=port), 
                      user=user_format,
                      password=password,
                      raise_exceptions=True
                    )

  def bind_connection(self):
    try:
      if self.connection:
        return self.connection.bind()
      else:
        return False
    except Exception as err:
      print(err)

      return False


  def close_connection(self):
    try:
      if self.connection:
        return self.connection.unbind()
      else:
        return False
    except Exception as err:
      print(err)

      return False

  
  def login_user(self, username, password):

    if not AUTH_ENABLED:
      return True, "Conexión de prueba"

    user = self.search_exact_user(username)
    if not user:
      return False, "No se encontró el usuario en el LDAP"
    elif not user['activo']:
      return False, "El usuario se encuentra inactivo en el LDAP"

    # loguear usuario
    user_format = USER_FORMAT.format(username)

    connection = Connection(
                      Server(self.server, port=self.port),
                      user=user_format,
                      password=password,
                      raise_exceptions=True
                    )

    try:
      connection.bind()
      connection.unbind()
      return True, "Conexión exitosa"
    except Exception as err:
      print(err)
      data_match = re.search("data\s\d+\w+", err.message)
      err_data = data_match.group().split(" ")[1] if data_match is not None else "0" # 0 -> cod. error desconocido
      error = CodigoAutenticacionLdapEnum.search_status_code_data(err_data)

      return False, error.descripcion


  def search_exact_user(self, username):
    self.bind_connection()

    query = f'(&(objectclass=person)(sAMAccountName={username}))'
    
    self.connection.search(
        search_base=BASE_DN,
        search_filter=query,
        attributes=COMPLETE_ATTRS,
        search_scope=SUBTREE,
        size_limit=SEARCH_MAX_RESULTS
      )
    response = self.connection.response

    result = None
    for entry in response:
        if(SEARCH_RESULT_STR == entry.get(RESULT_TYPE_STR)):
            result = self.__serialize_user(entry.get(ATTRIBUTES_STR))

    self.close_connection()
    return result


  def search_user(self, username):
    self.bind_connection()

    # NOTE: no se puede buscar diferentes OUs ya que necesita hacer la peticion
    # al global catalog del LDAP y los puertos estan cerrados (3268/3269)
    # (!(memberOf=Bloqueados))
    # https://stackoverflow.com/questions/9184978/ldap-root-query-syntax-to-search-more-than-one-specific-ou
    query = f"""(|
      (&(objectclass=person)(sAMAccountName=*{username}*))
      (&(objectclass=person)(cn=*{username}*))
    )"""
    
    self.connection.search(
        search_base=BASE_DN,
        search_filter=query,
        attributes=COMPLETE_ATTRS,
        search_scope=SUBTREE,
        size_limit=SEARCH_MAX_RESULTS
      )
    response = self.connection.response

    results = []
    for entry in response:
        if(SEARCH_RESULT_STR == entry.get(RESULT_TYPE_STR)):
            results.append(entry.get(ATTRIBUTES_STR))
    
    serialized_results = map(lambda user: self.__serialize_user(user), results)

    self.close_connection()
    return serialized_results
  

  def user_exists(self, username):

    if len(username) < 3:
      return False

    self.bind_connection()

    query = f'(&(objectclass=person)(sAMAccountName={username}))'
    
    self.connection.search(
        search_base=BASE_DN,
        search_filter=query,
        attributes=COMPLETE_ATTRS,
        search_scope=SUBTREE
      )
    response = self.connection.response

    for entry in response:
        if(SEARCH_RESULT_STR == entry.get(RESULT_TYPE_STR)):
            return True

    return False


  def __serialize_user(self, data):

    return {
      "nombre_completo": data["cn"],
      "dependencia": data["streetAddress"],
      "correo": data["mail"],
      "activo": CodigoLdapEnum.is_active(data["userAccountControl"]),
      "usuario": data["sAMAccountName"],
    }


class CodigoLdapEnum(Enum):

  CUENTA_HABILITADA = (512, "Cuenta habilitada") # LDAP
  CUENTA_HABILITADA_PASS_NEVER_EXPIRE = (66048, "Cuenta habilitada contraseña nunca expira") # LDAP
  CUENTA_DESHABILITADA = (514, "Cuenta deshabilitada") # LDAP
  CUENTA_DESHABILITADA_PASS_NEVER_EXPIRE = (66050, "Cuenta deshabilitada contraseña nunca expira")

  def __init__(self, codigo_estado, descripcion):
    self.codigo_estado = codigo_estado
    self.descripcion = descripcion


  @classmethod
  def search_status_code(self, status_code):
    for item in self:
      if item.codigo_estado == int(status_code):
        return item
    return None
  

  @classmethod
  def is_active(self, status_code):
    return (int(status_code) == self.CUENTA_HABILITADA.codigo_estado or
        int(status_code) == self.CUENTA_HABILITADA_PASS_NEVER_EXPIRE.codigo_estado)



class CodigoAutenticacionLdapEnum(Enum):
  AUTH_CONTRASENA_INCORRECTA = ("52e", "Usuario y contraseña no válidos")
  AUTH_USUARIO_NO_ENCONTRADO = ("525", "Usuario no encontrado")
  AUTH_NO_LOGON_AHORA = ("530", "No se permite iniciar sesión en este momento")
  AUTH_NO_LOGON_ETRABAJO = ("531", "No se permite iniciar sesión en este equipo")
  AUTH_CONTRASENA_EXPIRADA = ("532", "Contraseña Expirada")
  AUTH_CUENTA_DESHABILITADA = ("533", "Cuenta deshabilitada")
  AUTH_CUENTA_EXPIRADA = ("701", "Cuenta Expirada")
  AUTH_RESETEAR_CONTRASENA = ("773", "Usuario debe cambiar el password")
  AUTH_CUENTA_BLOQUEADA = ("775", "La cuenta esta bloqueada")
  AUTH_RESPUESTA_NO_CONTROLADA = ("0", "Error desconocido sistema de autenticación")

  def __init__(self, data, descripcion):
    self.data = data
    self.descripcion = descripcion

    
  @classmethod
  def search_status_code_data(self, data):
    for item in self:
      if item.data == data.strip():
        return item
    return None
