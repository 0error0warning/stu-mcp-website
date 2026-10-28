import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('product_sync',Path(__file__).parents[1]/'scripts/sync-product.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
SOURCE='''def build_server():
    def tool():
        return server.tool()
    @tool()
    def alpha(): pass
    @tool()
    def beta(): pass
'''
class ProductSyncTests(unittest.TestCase):
    def test_registered_functions_not_comments(self):
        data=module.parse_product('[project]\nversion = "1.2.3"',SOURCE+'\n# @tool()\n','# v1.2.3 · 标题\n共 2 项工具','1.2.3')
        self.assertEqual(data['toolCount'],2)
    def test_mismatch_fails_closed(self):
        for project,notes in [('[project]\nversion = "1.2.2"','# v1.2.3 标题'),('[project]\nversion = "1.2.3"','# v1.2.3 标题\n3 项工具')]:
            with self.assertRaises(ValueError):module.parse_product(project,SOURCE,notes,'1.2.3')
    def test_network_failure_keeps_previous_bytes(self):
        with tempfile.TemporaryDirectory() as folder:
            output=Path(folder)/'product.json';output.write_text('previous')
            with patch.object(module,'read',side_effect=OSError('offline')):
                with self.assertRaises(OSError):module.sync(output)
            self.assertEqual(output.read_text(),'previous')
if __name__=='__main__':unittest.main()
