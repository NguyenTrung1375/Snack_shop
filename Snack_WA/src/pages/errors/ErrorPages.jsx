import { Button, Result } from 'antd';
import { Link } from 'react-router-dom';
export const ForbiddenPage = () => <Result status="403" title="Bạn không có quyền truy cập" subTitle="Tài khoản hiện tại không được cấp quyền cho khu vực này." extra={<Link to="/"><Button type="primary">Về trang chủ</Button></Link>} />;
export const NotFoundPage = () => <Result status="404" title="Không tìm thấy trang" extra={<Link to="/"><Button type="primary">Về trang chủ</Button></Link>} />;
