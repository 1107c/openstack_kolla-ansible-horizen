# OpenStack 관리 대시보드 프로젝트

이 프로젝트는 OpenStack 환경에서 가상 머신(VM)과 네트워크를 관리하기 위한 백엔드 서비스입니다. Node.js로 구현되었으며, OpenStack의 Nova API와 Neutron API를 활용하여 주요 기능을 제공합니다. API 문서화는 Swagger JSDoc를 통해 이루어졌습니다. OpenStack 환경은 Kolla를 사용하여 배포되었습니다.

## 프로젝트 개요

- **백엔드**: Node.js
- **API 문서화**: Swagger JSDoc
- **OpenStack 배포**: Kolla
- **목표**: OpenStack 환경에서 VM 및 네트워크 관리를 위한 RESTful API 제공

## 주요 기능

### 1. 가상 머신 관리 대시보드
- **VM 목록 조회**: 현재 생성된 가상 머신 목록을 조회합니다.
- **VM 생성 및 삭제**: 이미지, flavor, 네트워크를 기반으로 VM을 생성하거나 삭제합니다.
- **VM 시작/중지**: VM의 상태를 제어합니다(시작, 중지).
- **가상 머신 이미지 관리**: VM 이미지를 업로드하거나 삭제합니다.
- **활용 API**: Nova API (OpenStack Compute Service)

### 2. 네트워크 관리 대시보드
- **네트워크 생성 및 삭제**: 네트워크를 생성하거나 삭제합니다.
- **활용 API**: Neutron API (OpenStack Networking Service)

## 사전 요구 사항

- Node.js (버전 v12.22.9 이상 권장)
- OpenStack 환경 (Kolla로 배포)
- OpenStack 클라이언트 라이브러리 (`openstack-client` 등)
- Swagger UI 및 Swagger JSDoc 설치
- 2 network interfaces
- 8GB main memory
- 40GB disk space

## 설치 방법
1.**openstack 환경 구축**
  자세한 API 사용법은 globals.yml 파일과 Kolla Quick Start 문서(https://docs.openstack.org/kolla-ansible/latest/user/quickstart.html)를 참조하세요.
1. **레포지토리 클론**
   ```bash
   git clone https://github.com/[your-repo]/openstack-dashboard.git
   cd openstack-dashboard
   ```

2. **의존성 설치 및 서버 실행**
   ```bash
   npm install
   npm app.js
   ```
4. Swagger API 문서 확인 서버 실행 후 브라우저에서 http://localhost:3000/api-docs로 접속하여 API 문서를 확인할 수 있습니다.
   자세한 API 사용법은 Swagger 문서(http://localhost:3000/api-docs)를 참조하세요. 아래는 프로젝트의 스크린샷입니다:
라이선스
이 프로젝트는 MIT 라이선스에 따라 배포됩니다.

문의
추가 질문이 있거나 문제가 발생할 경우, 이메일 또는 이슈 트래커를 통해 문의하세요.

